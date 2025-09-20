package com.pcd.vehicles.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Vehicle event for Kafka messaging between services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleEvent {
    
    public enum EventType {
        VEHICLE_CREATED,
        VEHICLE_UPDATED,
        VEHICLE_DELETED,
        VEHICLE_STATUS_CHANGED,
        VEHICLE_MAINTENANCE_SCHEDULED,
        VEHICLE_LOCATION_UPDATED
    }
    
    public enum Status {
        ACTIVE,
        INACTIVE,
        MAINTENANCE,
        IN_USE
    }
    
    public enum FuelType {
        GASOLINE,
        DIESEL,
        ELECTRIC,
        HYBRID
    }
    
    private UUID vehicleId;
    private EventType eventType;
    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private Status status;
    private String vin;
    private String color;
    private Long mileage;
    private FuelType fuelType;
    private Integer seatingCapacity;
    private Long rentalPricePerDay;
    private Boolean gpsEnabled;
    private LocalDateTime lastMaintenanceDate;
    private Integer maintenanceIntervalDays;
    private LocalDateTime nextMaintenanceDate;
    private LocalDateTime timestamp;
    private String correlationId;
    private String source;
}
