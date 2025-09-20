package com.pcd.tripsservice.exceptions;


public class NotFoundException extends BaseGraphQLException {

    public NotFoundException(String message) {
        super(message, "NOT_FOUND");
    }

    public NotFoundException(String message, String details) {
        super(message, "NOT_FOUND", details);
    }

    public NotFoundException(String message, Throwable cause) {
        super(message, "NOT_FOUND", null, cause);
    }

    public NotFoundException(String message, String details, Throwable cause) {
        super(message, "NOT_FOUND", details, cause);
    }

    // Common factory methods for specific not found scenarios
    public static NotFoundException resourceNotFound(String resourceType, String id) {
        return new NotFoundException(resourceType + " not found", 
            "No " + resourceType.toLowerCase() + " found with ID: " + id);
    }

    public static NotFoundException tripNotFound(String tripId) {
        return new NotFoundException("Trip not found", 
            "No trip found with ID: " + tripId);
    }

    public static NotFoundException vehicleNotFound(String vehicleId) {
        return new NotFoundException("Vehicle not found", 
            "No vehicle found with ID: " + vehicleId);
    }

    public static NotFoundException driverNotFound(String driverId) {
        return new NotFoundException("Driver not found", 
            "No driver found with ID: " + driverId);
    }

    public static NotFoundException customerNotFound(String customerId) {
        return new NotFoundException("Customer not found", 
            "No customer found with ID: " + customerId);
    }

    public static NotFoundException routeNotFound(String routeId) {
        return new NotFoundException("Route not found", 
            "No route found with ID: " + routeId);
    }
}
