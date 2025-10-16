package com.pcd.tripsservice.exceptions;

import java.util.List;
import java.util.stream.Collectors;

public class BadRequestException extends BaseGraphQLException {

    public BadRequestException(String message) {
        super(message, "BAD_REQUEST");
    }

    public BadRequestException(String message, String details) {
        super(message, "BAD_REQUEST", details);
    }

    public BadRequestException(String message, List<ValidationError> validationErrors) {
        super(message, "BAD_REQUEST");
        if (validationErrors != null && !validationErrors.isEmpty()) {
            addExtension("validation", validationErrors.stream()
                .collect(Collectors.toMap(
                    ValidationError::getField,
                        ValidationError::getMessage,
                    (existing, replacement) -> existing + "; " + replacement
                )));
        }
    }

    public BadRequestException(String message, String details, List<ValidationError> validationErrors) {
        super(message, "BAD_REQUEST", details);
        if (validationErrors != null && !validationErrors.isEmpty()) {
            addExtension("validation", validationErrors.stream()
                .collect(Collectors.toMap(
                    ValidationError::getField,
                        ValidationError::getMessage,
                    (existing, replacement) -> existing + "; " + replacement
                )));
        }
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, "BAD_REQUEST", null, cause);
    }
}
