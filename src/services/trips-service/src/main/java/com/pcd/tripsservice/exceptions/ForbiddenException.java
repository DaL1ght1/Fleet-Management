package com.pcd.tripsservice.exceptions;

/**
 * GraphQL exception for FORBIDDEN errors (403)
 */
public class ForbiddenException extends BaseGraphQLException {

    public ForbiddenException(String message) {
        super(message, "FORBIDDEN");
    }

    public ForbiddenException(String message, String details) {
        super(message, "FORBIDDEN", details);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, "FORBIDDEN", null, cause);
    }

    public ForbiddenException(String message, String details, Throwable cause) {
        super(message, "FORBIDDEN", details, cause);
    }

    // Common factory methods for specific forbidden scenarios
    public static ForbiddenException insufficientPermissions(String resource) {
        return new ForbiddenException("Access denied", 
            "You do not have permission to access " + resource);
    }

    public static ForbiddenException insufficientRole(String requiredRole) {
        return new ForbiddenException("Access denied", 
            "This operation requires " + requiredRole + " role or higher");
    }

    public static ForbiddenException resourceOwnershipRequired(String resourceType, String resourceId) {
        return new ForbiddenException("Access denied", 
            "You can only access your own " + resourceType + " (ID: " + resourceId + ")");
    }

    public static ForbiddenException operationNotAllowed(String operation) {
        return new ForbiddenException("Operation not allowed", 
            "The " + operation + " operation is not permitted for your account");
    }
}
