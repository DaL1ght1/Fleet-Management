package com.pcd.identityservice.domain;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

public record Account(UUID id, String email, String firstName, String lastName, Set<Role> roles, boolean enabled) {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int MAX_NAME_LENGTH = 60;

    public static String normalizeEmail(String email) {
        if (email == null || !EMAIL.matcher(email.strip()).matches()) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
        return email.strip().toLowerCase(Locale.ROOT);
    }

    public static String requireName(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        if (value.strip().length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(field + " must be at most " + MAX_NAME_LENGTH + " characters");
        }
        return value.strip();
    }
}
