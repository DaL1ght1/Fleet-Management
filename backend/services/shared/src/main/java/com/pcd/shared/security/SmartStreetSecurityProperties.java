package com.pcd.shared.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.List;

@ConfigurationProperties("smartstreet.security")
public record SmartStreetSecurityProperties(
        String routerSecret,
        @DefaultValue("/actuator/health/**") List<String> publicPaths,
        @DefaultValue("/graphql/**") List<String> routerProtectedPaths,
        @DefaultValue({}) List<String> corsOrigins) {

    public SmartStreetSecurityProperties {
        if (routerSecret == null || routerSecret.isBlank()) {
            throw new IllegalStateException("smartstreet.security.router-secret must be configured");
        }
        publicPaths = List.copyOf(publicPaths);
        routerProtectedPaths = List.copyOf(routerProtectedPaths);
        corsOrigins = List.copyOf(corsOrigins);
    }
}
