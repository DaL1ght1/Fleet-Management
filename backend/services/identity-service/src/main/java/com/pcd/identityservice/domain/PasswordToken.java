package com.pcd.identityservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Entity
@Table(name = "password_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordToken {

    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Id
    private UUID id;

    private UUID accountId;

    @Enumerated(EnumType.STRING)
    private Purpose purpose;

    private String tokenHash;

    private Instant expiresAt;

    private Instant usedAt;

    public enum Purpose {
        RESET,
        INVITATION
    }

    public record Issued(PasswordToken token, String secret) {
    }

    public static Issued issue(UUID accountId, Purpose purpose, Instant now, Duration ttl) {
        byte[] bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        PasswordToken token = new PasswordToken();
        token.id = UUID.randomUUID();
        token.accountId = accountId;
        token.purpose = purpose;
        token.tokenHash = hash(secret);
        token.expiresAt = now.plus(ttl);
        return new Issued(token, secret);
    }

    public void redeem(Instant now) {
        if (usedAt != null || now.isAfter(expiresAt)) {
            throw new BusinessRuleViolationException("This link has expired or was already used");
        }
        usedAt = now;
    }

    public static String hash(String secret) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(secret.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException unavailable) {
            throw new IllegalStateException("SHA-256 is not available", unavailable);
        }
    }
}
