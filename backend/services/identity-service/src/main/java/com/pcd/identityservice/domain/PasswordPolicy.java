package com.pcd.identityservice.domain;

public final class PasswordPolicy {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;

    private PasswordPolicy() {
    }

    public static String validate(String password) {
        if (password == null || password.length() < MIN_LENGTH || password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Password must be between %d and %d characters"
                    .formatted(MIN_LENGTH, MAX_LENGTH));
        }
        if (password.chars().noneMatch(Character::isLetter) || password.chars().noneMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Password must contain at least one letter and one digit");
        }
        return password;
    }
}
