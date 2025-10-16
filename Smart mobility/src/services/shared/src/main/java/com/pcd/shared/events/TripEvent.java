package com.pcd.shared.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Trip event for Kafka messaging between services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripEvent {
    
    public enum EventType {
        TRIP_CREATED,
        TRIP_STARTED,
        TRIP_COMPLETED,
        TRIP_CANCELLED,
        TRIP_UPDATED,
        TRIP_LOCATION_UPDATED
    }
    
    public enum TripStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
    
    public enum TripType {
        RENTAL,
        MAINTENANCE,
        RELOCATION,
        EMERGENCY
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private Double latitude;
        private Double longitude;
        private String address;
        private String city;
        private String state;
        private String zipCode;
    }
    
    private UUID tripId;
    private EventType eventType;
    private UUID vehicleId;
    private UUID driverId;
    private TripType type;
    private TripStatus status;
    private Location startLocation;
    private Location endLocation;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private BigDecimal distance;
    private Integer duration;
    private Integer estimatedDuration;
    private BigDecimal totalCost;
    private LocalDateTime timestamp;
    private String correlationId;
    private String source;
}
