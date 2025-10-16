package com.pcd.shared.events;

import com.pcd.shared.enums.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Driver event for Kafka messaging between services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverEvent {
    
    public enum EventType {
        DRIVER_CREATED,
        DRIVER_UPDATED,
        DRIVER_DELETED,
        DRIVER_STATUS_CHANGED,
        DRIVER_ASSIGNED_TO_TRIP,
        DRIVER_TRIP_COMPLETED
    }
    
    // Basic driver info (inherited from User)
    private UUID driverId;
    private EventType eventType;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    
    // Driver-specific fields
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private DriverStatus status;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private UUID currentTripId;
    private BigDecimal rating;
    
    // Event metadata
    private LocalDateTime timestamp;
    private String correlationId;
    private String source;
}