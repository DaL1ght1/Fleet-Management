package com.pcd.identityservice.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcd.identityservice.domain.Role;

import java.io.IOException;
import java.util.Base64;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

record AccessTokenClaims(UUID accountId, String email, String firstName, String lastName, Set<Role> roles) {

    private static final ObjectMapper JSON = new ObjectMapper();

    static AccessTokenClaims parse(String accessToken) {
        String[] parts = accessToken.split("\\.");
        if (parts.length < 2) {
            throw new IllegalStateException("Keycloak returned a malformed access token");
        }
        try {
            JsonNode payload = JSON.readTree(Base64.getUrlDecoder().decode(parts[1]));
            Set<Role> roles = EnumSet.noneOf(Role.class);
            payload.path("realm_access").path("roles").forEach(role -> {
                for (Role candidate : Role.values()) {
                    if (candidate.name().equalsIgnoreCase(role.asText())) {
                        roles.add(candidate);
                    }
                }
            });
            return new AccessTokenClaims(UUID.fromString(payload.path("sub").asText()),
                    payload.path("email").asText(null), payload.path("given_name").asText(null),
                    payload.path("family_name").asText(null), roles);
        } catch (IOException | IllegalArgumentException malformed) {
            throw new IllegalStateException("Keycloak returned an unreadable access token", malformed);
        }
    }

    Role primaryRole() {
        return roles.stream().sorted().findFirst().orElse(Role.USER);
    }
}
