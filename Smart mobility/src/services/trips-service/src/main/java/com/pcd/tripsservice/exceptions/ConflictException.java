package com.pcd.tripsservice.exceptions;

/**
 * GraphQL exception for CONFLICT errors (409)
 */
public class ConflictException extends BaseGraphQLException {

    public ConflictException(String message) {
        super(message, "CONFLICT");
    }

    public ConflictException(String message, String details) {
        super(message, "CONFLICT", details);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, "CONFLICT", null, cause);
    }

    public ConflictException(String message, String details, Throwable cause) {
        super(message, "CONFLICT", details, cause);
    }

    // Common factory methods for specific conflict scenarios
    public static ConflictException duplicateResource(String resourceType, String identifier) {
        return new ConflictException("Duplicate " + resourceType.toLowerCase(), 
            "A " + resourceType.toLowerCase() + " with identifier '" + identifier + "' already exists");
    }

    public static ConflictException tripScheduleConflict(String driverId, String timeSlot) {
        return new ConflictException("Trip scheduling conflict", 
            "Driver " + driverId + " is already assigned to another trip during " + timeSlot);
    }

    public static ConflictException vehicleUnavailable(String vehicleId, String timeSlot) {
        return new ConflictException("Vehicle unavailable", 
            "Vehicle " + vehicleId + " is already assigned to another trip during " + timeSlot);
    }

    public static ConflictException invalidStateTransition(String currentState, String targetState) {
        return new ConflictException("Invalid state transition", 
            "Cannot transition from " + currentState + " to " + targetState);
    }

    public static ConflictException tripAlreadyCompleted(String tripId) {
        return new ConflictException("Trip already completed", 
            "Trip " + tripId + " has already been completed and cannot be modified");
    }

    public static ConflictException tripAlreadyCancelled(String tripId) {
        return new ConflictException("Trip already cancelled", 
            "Trip " + tripId + " has already been cancelled and cannot be modified");
    }

    public static ConflictException resourceInUse(String resourceType, String resourceId, String usedBy) {
        return new ConflictException(resourceType + " is in use", 
            resourceType + " " + resourceId + " is currently being used by " + usedBy);
    }
}
