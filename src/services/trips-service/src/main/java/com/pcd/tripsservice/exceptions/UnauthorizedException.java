package com.pcd.tripsservice.exceptions;

/**
 * GraphQL exception for UNAUTHORIZED errors (401)
 */
public class UnauthorizedException extends BaseGraphQLException {

    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }

    public UnauthorizedException(String message, String details) {
        super(message, "UNAUTHORIZED", details);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, "UNAUTHORIZED", null, cause);
    }

    public UnauthorizedException(String message, String details, Throwable cause) {
        super(message, "UNAUTHORIZED", details, cause);
    }

    // Common factory methods for specific unauthorized scenarios
    public static UnauthorizedException invalidToken() {
        return new UnauthorizedException("Invalid or expired authentication token", 
            "The provided authentication token is invalid or has expired");
    }

    public static UnauthorizedException missingToken() {
        return new UnauthorizedException("Authentication required", 
            "No authentication token provided");
    }

    public static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException("Invalid credentials", 
            "The provided credentials are incorrect");
    }
}
