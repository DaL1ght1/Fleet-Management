package com.pcd.shared.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class KeycloakRealmRoleConverterTest {

    private final KeycloakRealmRoleConverter converter = new KeycloakRealmRoleConverter();

    @Test
    void mapsRealmRolesToUppercaseSpringAuthorities() {
        Jwt jwt = jwtWithClaims(Map.of("realm_access", Map.of("roles", List.of("admin", "MANAGER"))));

        assertThat(converter.convert(jwt))
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_MANAGER");
    }

    @Test
    void returnsNoAuthoritiesWhenRealmAccessIsMissing() {
        assertThat(converter.convert(jwtWithClaims(Map.of("scope", "openid")))).isEmpty();
    }

    @Test
    void returnsNoAuthoritiesWhenRolesAreNotACollection() {
        Jwt jwt = jwtWithClaims(Map.of("realm_access", Map.of("roles", "ADMIN")));

        assertThat(converter.convert(jwt)).isEmpty();
    }

    private static Jwt jwtWithClaims(Map<String, Object> claims) {
        return Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject("user")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .claims(existing -> existing.putAll(claims))
                .build();
    }
}
