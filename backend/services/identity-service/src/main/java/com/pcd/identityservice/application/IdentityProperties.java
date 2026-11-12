package com.pcd.identityservice.application;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

@ConfigurationProperties("smartstreet.identity")
public record IdentityProperties(
        String keycloakUrl,
        @DefaultValue("Smart-Street") String realm,
        @DefaultValue("smartstreet-identity") String clientId,
        String clientSecret,
        @DefaultValue("http://localhost:4200") String frontendUrl,
        @DefaultValue("true") boolean secureCookies,
        @DefaultValue("30m") Duration resetTokenTtl,
        @DefaultValue("72h") Duration invitationTtl,
        @DefaultValue("SmartStreet <no-reply@smartstreet.local>") String mailFrom) {

    public IdentityProperties {
        if (keycloakUrl == null || keycloakUrl.isBlank()) {
            throw new IllegalStateException("smartstreet.identity.keycloak-url must be configured");
        }
        if (clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException("smartstreet.identity.client-secret must be configured");
        }
    }
}
