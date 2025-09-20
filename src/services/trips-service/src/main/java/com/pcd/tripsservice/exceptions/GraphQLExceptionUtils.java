package com.pcd.tripsservice.exceptions;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for creating GraphQL exceptions and handling validation
 */
public class GraphQLExceptionUtils {

    private GraphQLExceptionUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Creates a validation error list builder
     */
    public static ValidationErrorBuilder validationErrors() {
        return new ValidationErrorBuilder();
    }

    /**
     * Builder class for validation errors
     */
    public static class ValidationErrorBuilder {
        private final List<ValidationError> errors = new ArrayList<>();

        public ValidationErrorBuilder addError(String field, String message) {
            errors.add(new ValidationError(field, message));
            return this;
        }

        public ValidationErrorBuilder addError(String field, String message, Object rejectedValue) {
            errors.add(new ValidationError(field, message, rejectedValue));
            return this;
        }

        public ValidationErrorBuilder addError(String field, String message, Object rejectedValue, String code) {
            errors.add(new ValidationError(field, message, rejectedValue, code));
            return this;
        }

        public ValidationErrorBuilder addRequiredFieldError(String field) {
            return addError(field, field + " is required", null, "REQUIRED");
        }

        public ValidationErrorBuilder addInvalidFormatError(String field, Object value) {
            return addError(field, field + " has invalid format", value, "INVALID_FORMAT");
        }

        public ValidationErrorBuilder addInvalidRangeError(String field, Object value, String range) {
            return addError(field, field + " must be " + range, value, "INVALID_RANGE");
        }

        public ValidationErrorBuilder addTooLongError(String field, Object value, int maxLength) {
            return addError(field, field + " must not exceed " + maxLength + " characters", value, "TOO_LONG");
        }

        public ValidationErrorBuilder addTooShortError(String field, Object value, int minLength) {
            return addError(field, field + " must be at least " + minLength + " characters", value, "TOO_SHORT");
        }

        public List<ValidationError> build() {
            return new ArrayList<>(errors);
        }

        public BadRequestException buildBadRequestException(String message) {
            return new BadRequestException(message, build());
        }

        public BadRequestException buildBadRequestException(String message, String details) {
            return new BadRequestException(message, details, build());
        }

        public boolean hasErrors() {
            return !errors.isEmpty();
        }

        public int getErrorCount() {
            return errors.size();
        }
    }

    /**
     * Common validation methods
     */
    public static class Validators {

        public static void validateRequired(ValidationErrorBuilder builder, String field, Object value) {
            if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
                builder.addRequiredFieldError(field);
            }
        }

        public static void validateStringLength(ValidationErrorBuilder builder, String field, String value, 
                int minLength, int maxLength) {
            if (value != null) {
                if (value.length() < minLength) {
                    builder.addTooShortError(field, value, minLength);
                }
                if (value.length() > maxLength) {
                    builder.addTooLongError(field, value, maxLength);
                }
            }
        }

        public static void validateEmail(ValidationErrorBuilder builder, String field, String email) {
            if (email != null && !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                builder.addInvalidFormatError(field, email);
            }
        }

        public static void validatePhoneNumber(ValidationErrorBuilder builder, String field, String phone) {
            if (phone != null && !phone.matches("^\\+?[1-9]\\d{1,14}$")) {
                builder.addInvalidFormatError(field, phone);
            }
        }

        public static void validatePositiveNumber(ValidationErrorBuilder builder, String field, Number value) {
            if (value != null && value.doubleValue() <= 0) {
                builder.addInvalidRangeError(field, value, "greater than 0");
            }
        }

        public static void validateNonNegativeNumber(ValidationErrorBuilder builder, String field, Number value) {
            if (value != null && value.doubleValue() < 0) {
                builder.addInvalidRangeError(field, value, "greater than or equal to 0");
            }
        }
    }
}
