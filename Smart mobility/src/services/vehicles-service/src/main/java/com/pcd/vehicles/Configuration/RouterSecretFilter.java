package com.pcd.vehicles.Configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class RouterSecretFilter extends OncePerRequestFilter {
    @Value("${router.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(HttpServletRequest req, @NotNull HttpServletResponse res, @NotNull FilterChain chain)
            throws ServletException, IOException {

        String path = req.getRequestURI();
        if (path.startsWith("/actuator") || path.startsWith("/graphiql")) {
            chain.doFilter(req, res);
            return;
        }

        String header = req.getHeader("x-router-secret");
        if (secret == null || !secret.equals(header)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        chain.doFilter(req, res);
    }
}
