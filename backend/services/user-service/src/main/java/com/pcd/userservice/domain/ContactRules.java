package com.pcd.userservice.domain;

import java.util.Locale;
import java.util.regex.Pattern;

final class ContactRules {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern PHONE = Pattern.compile("^\\+?[0-9 ()-]{6,20}$");
    private static final int MAX_NAME_LENGTH = 60;

    private ContactRules() {
    }

    static String name(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        String trimmed = value.strip();
        if (trimmed.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(field + " must be at most " + MAX_NAME_LENGTH + " characters");
        }
        return trimmed;
    }

    static String email(String value) {
        if (value == null || !EMAIL.matcher(value.strip()).matches()) {
            throw new IllegalArgumentException("email must be a valid address");
        }
        return value.strip().toLowerCase(Locale.ROOT);
    }

    static String phone(String value, boolean required) {
        if (value == null || value.isBlank()) {
            if (required) {
                throw new IllegalArgumentException("phoneNumber is required");
            }
            return null;
        }
        if (!PHONE.matcher(value.strip()).matches()) {
            throw new IllegalArgumentException("phoneNumber must be a valid phone number");
        }
        return value.strip();
    }
}
