package com.pcd.tripsservice.exceptions;

/**
 * GraphQL exception for INTERNAL errors (500)
 */
public class InternalServerException extends BaseGraphQLException {

    public InternalServerException(String message) {
        super(message, "INTERNAL");
    }

    public InternalServerException(String message, String details) {
        super(message, "INTERNAL", details);
    }

    public InternalServerException(String message, Throwable cause) {
        super(message, "INTERNAL", null, cause);
    }

    public InternalServerException(String message, String details, Throwable cause) {
        super(message, "INTERNAL", details, cause);
    }

    // Common factory methods for specific internal error scenarios
    public static InternalServerException databaseError(Throwable cause) {
        return new InternalServerException("Database operation failed", 
            "An error occurred while performing database operation", cause);
    }

    public static InternalServerException externalServiceError(String serviceName, Throwable cause) {
        return new InternalServerException("External service error", 
            "Failed to communicate with " + serviceName + " service", cause);
    }

    public static InternalServerException configurationError(String configKey) {
        return new InternalServerException("Configuration error", 
            "Missing or invalid configuration for: " + configKey);
    }

    public static InternalServerException processingError(String operation, Throwable cause) {
        return new InternalServerException("Processing error", 
            "An error occurred while processing " + operation, cause);
    }

    public static InternalServerException unexpectedError(Throwable cause) {
        return new InternalServerException("Unexpected error", 
            "An unexpected error occurred. Please try again later.", cause);
    }

    public static InternalServerException serviceUnavailable(String serviceName) {
        return new InternalServerException("Service unavailable", 
            "The " + serviceName + " service is currently unavailable");
    }
}
