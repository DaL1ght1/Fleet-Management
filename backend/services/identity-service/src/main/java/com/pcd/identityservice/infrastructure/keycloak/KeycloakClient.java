package com.pcd.identityservice.infrastructure.keycloak;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.pcd.identityservice.application.IdentityProperties;
import com.pcd.identityservice.domain.Account;
import com.pcd.identityservice.domain.Role;
import com.pcd.shared.error.ConflictException;
import com.pcd.shared.error.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class KeycloakClient {

    private static final long TOKEN_SAFETY_MARGIN_SECONDS = 30;

    private final RestClient http;
    private final IdentityProperties properties;
    private final Clock clock;
    private volatile CachedToken serviceToken;

    public KeycloakClient(RestClient.Builder builder, IdentityProperties properties, Clock clock) {
        this.http = builder.baseUrl(properties.keycloakUrl()).build();
        this.properties = properties;
        this.clock = clock;
    }

    public TokenSet passwordGrant(String email, String password) {
        MultiValueMap<String, String> form = clientForm("password");
        form.add("username", email);
        form.add("password", password);
        form.add("scope", "openid");
        return token(form);
    }

    public TokenSet refreshGrant(String refreshToken) {
        MultiValueMap<String, String> form = clientForm("refresh_token");
        form.add("refresh_token", refreshToken);
        return token(form);
    }

    public void logout(String refreshToken) {
        MultiValueMap<String, String> form = clientForm(null);
        form.add("refresh_token", refreshToken);
        try {
            http.post().uri(realmPath("/protocol/openid-connect/logout"))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException ignored) {
            return;
        }
    }

    public UUID createUser(String email, String firstName, String lastName, String password) {
        UserRepresentation user = new UserRepresentation(null, email, email, firstName, lastName, true, true,
                password == null ? null : List.of(CredentialRepresentation.password(password)));
        try {
            ResponseEntity<Void> response = admin().post().uri(adminPath("/users"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(user)
                    .retrieve()
                    .toBodilessEntity();
            URI location = response.getHeaders().getLocation();
            if (location == null) {
                throw new IllegalStateException("Keycloak did not return the created user location");
            }
            String path = location.getPath();
            return UUID.fromString(path.substring(path.lastIndexOf('/') + 1));
        } catch (HttpClientErrorException.Conflict exists) {
            throw new ConflictException("An account with this email already exists");
        } catch (HttpClientErrorException.BadRequest invalid) {
            throw new IllegalArgumentException(describe(invalid));
        }
    }

    public void assignRole(UUID userId, Role role) {
        RoleRepresentation representation = admin().get().uri(adminPath("/roles/" + role.name()))
                .retrieve()
                .body(RoleRepresentation.class);
        admin().post().uri(adminPath("/users/" + userId + "/role-mappings/realm"))
                .contentType(MediaType.APPLICATION_JSON)
                .body(List.of(representation))
                .retrieve()
                .toBodilessEntity();
    }

    public Optional<Account> findByEmail(String email) {
        UserRepresentation[] users = admin().get()
                .uri(uri -> uri.path(adminPath("/users")).queryParam("email", email).queryParam("exact", true).build())
                .retrieve()
                .body(UserRepresentation[].class);
        return users == null ? Optional.empty() : Arrays.stream(users).findFirst().map(this::toAccount);
    }

    public Account get(UUID userId) {
        try {
            UserRepresentation user = admin().get().uri(adminPath("/users/" + userId))
                    .retrieve()
                    .body(UserRepresentation.class);
            return toAccount(user);
        } catch (HttpClientErrorException.NotFound missing) {
            throw new NotFoundException("Account", userId);
        }
    }

    public void update(UUID userId, String email, String firstName, String lastName) {
        try {
            admin().put().uri(adminPath("/users/" + userId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new UserRepresentation(null, email, email, firstName, lastName, null, null, null))
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.Conflict exists) {
            throw new ConflictException("An account with this email already exists");
        }
    }

    public void setPassword(UUID userId, String password) {
        try {
            admin().put().uri(adminPath("/users/" + userId + "/reset-password"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(CredentialRepresentation.password(password))
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.BadRequest invalid) {
            throw new IllegalArgumentException(describe(invalid));
        }
    }

    public void signOutEverywhere(UUID userId) {
        admin().post().uri(adminPath("/users/" + userId + "/logout")).retrieve().toBodilessEntity();
    }

    private Account toAccount(UserRepresentation user) {
        return new Account(UUID.fromString(user.id()), user.email(), user.firstName(), user.lastName(),
                roles(user.id()), Boolean.TRUE.equals(user.enabled()));
    }

    private Set<Role> roles(String userId) {
        RoleRepresentation[] mapped = admin().get().uri(adminPath("/users/" + userId + "/role-mappings/realm/composite"))
                .retrieve()
                .body(RoleRepresentation[].class);
        Set<String> names = mapped == null ? Set.of()
                : Arrays.stream(mapped).map(RoleRepresentation::name).collect(Collectors.toSet());
        return EnumSet.allOf(Role.class).stream().filter(role -> names.contains(role.name()))
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(Role.class)));
    }

    private TokenSet token(MultiValueMap<String, String> form) {
        try {
            return http.post().uri(realmPath("/protocol/openid-connect/token"))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(TokenSet.class);
        } catch (HttpClientErrorException failure) {
            if (failure.getStatusCode() == HttpStatus.UNAUTHORIZED || failure.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new InvalidCredentialsException(loginFailure(failure));
            }
            throw failure;
        }
    }

    private RestClient admin() {
        CachedToken current = serviceToken;
        Instant now = clock.instant();
        if (current == null || now.isAfter(current.expiresAt())) {
            TokenSet token = token(clientForm("client_credentials"));
            current = new CachedToken(token.accessToken(),
                    now.plusSeconds(Math.max(0, token.expiresIn() - TOKEN_SAFETY_MARGIN_SECONDS)));
            serviceToken = current;
        }
        String bearer = "Bearer " + current.value();
        return http.mutate().defaultHeader("Authorization", bearer).build();
    }

    private MultiValueMap<String, String> clientForm(String grantType) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        if (grantType != null) {
            form.add("grant_type", grantType);
        }
        form.add("client_id", properties.clientId());
        form.add("client_secret", properties.clientSecret());
        return form;
    }

    private String realmPath(String suffix) {
        return "/realms/" + properties.realm() + suffix;
    }

    private String adminPath(String suffix) {
        return "/admin/realms/" + properties.realm() + suffix;
    }

    private static String loginFailure(HttpClientErrorException failure) {
        String description = failure.getResponseBodyAs(ErrorResponse.class) instanceof ErrorResponse error
                && error.errorDescription() != null ? error.errorDescription() : "";
        if (description.contains("disabled")) {
            return "This account is disabled";
        }
        if (description.contains("not fully set up")) {
            return "This account must be activated from the invitation email first";
        }
        return "Incorrect email or password";
    }

    private static String describe(HttpClientErrorException failure) {
        ErrorResponse error = failure.getResponseBodyAs(ErrorResponse.class);
        if (error == null) {
            return "The request was rejected";
        }
        return error.errorDescription() != null ? error.errorDescription()
                : error.errorMessage() != null ? error.errorMessage() : "The request was rejected";
    }

    private record CachedToken(String value, Instant expiresAt) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    record UserRepresentation(String id, String username, String email, String firstName, String lastName,
                              Boolean enabled, Boolean emailVerified, List<CredentialRepresentation> credentials) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    record CredentialRepresentation(String type, String value, boolean temporary) {

        static CredentialRepresentation password(String value) {
            return new CredentialRepresentation("password", value, false);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record RoleRepresentation(String id, String name, Map<String, Object> attributes) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ErrorResponse(String error,
                         @com.fasterxml.jackson.annotation.JsonProperty("error_description") String errorDescription,
                         String errorMessage) {
    }
}
