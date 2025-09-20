package com.pcd.tripsservice.exceptions;

import lombok.Getter;

/**
 * Represents a field validation error
 */
@Getter
public class ValidationError {
    private final String field;
    private final String message;
    private final Object rejectedValue;
    private final String code;

    public ValidationError(String field, String message) {
        this(field, message, null, null);
    }

    public ValidationError(String field, String message, Object rejectedValue) {
        this(field, message, rejectedValue, null);
    }

    public ValidationError(String field, String message, Object rejectedValue, String code) {
        this.field = field;
        this.message = message;
        this.rejectedValue = rejectedValue;
        this.code = code;
    }

    @Override
    public String toString() {
        return "ValidationError{" +
                "field='" + field + '\'' +
                ", message='" + message + '\'' +
                ", rejectedValue=" + rejectedValue +
                ", code='" + code + '\'' +
                '}';
    }
}
