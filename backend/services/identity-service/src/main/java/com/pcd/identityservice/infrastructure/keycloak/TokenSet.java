package com.pcd.identityservice.infrastructure.keycloak;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TokenSet(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") long expiresIn,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("refresh_expires_in") long refreshExpiresIn) {
}
