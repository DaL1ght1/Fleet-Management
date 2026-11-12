package com.pcd.telemetryservice.domain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

public record DeviceKey(String value) {

    private static final int KEY_BYTES = 32;
    private static final String PREFIX = "ssd_";
    private static final SecureRandom RANDOM = new SecureRandom();

    public static DeviceKey generate() {
        byte[] bytes = new byte[KEY_BYTES];
        RANDOM.nextBytes(bytes);
        return new DeviceKey(PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
    }

    public String hash() {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException unavailable) {
            throw new IllegalStateException("SHA-256 is not available", unavailable);
        }
    }

    @Override
    public String toString() {
        return PREFIX + "****";
    }
}
