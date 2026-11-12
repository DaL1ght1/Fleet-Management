package com.pcd.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class RouterSecretFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "x-router-secret";

    private final byte[] expectedSecret;
    private final RequestMatcher protectedRequests;

    public RouterSecretFilter(String routerSecret, RequestMatcher protectedRequests) {
        this.expectedSecret = routerSecret.getBytes(StandardCharsets.UTF_8);
        this.protectedRequests = protectedRequests;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !protectedRequests.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String providedSecret = request.getHeader(HEADER_NAME);
        if (providedSecret == null
                || !MessageDigest.isEqual(expectedSecret, providedSecret.getBytes(StandardCharsets.UTF_8))) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        chain.doFilter(request, response);
    }
}
