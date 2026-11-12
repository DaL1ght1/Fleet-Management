package com.pcd.identityservice.web;

import com.pcd.identityservice.application.IdentityProperties;
import com.pcd.identityservice.infrastructure.keycloak.TokenSet;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class SessionCookies {

    public static final String REFRESH_COOKIE = "ss_session";
    private static final String COOKIE_PATH = "/auth";

    private final IdentityProperties properties;

    public ResponseCookie issue(TokenSet tokens) {
        return base(tokens.refreshToken()).maxAge(Duration.ofSeconds(tokens.refreshExpiresIn())).build();
    }

    public ResponseCookie clear() {
        return base("").maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(properties.secureCookies())
                .sameSite("Strict")
                .path(COOKIE_PATH);
    }
}
