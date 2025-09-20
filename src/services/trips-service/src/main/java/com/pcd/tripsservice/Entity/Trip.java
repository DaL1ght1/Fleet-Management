package com.pcd.tripsservice.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Trip entity representing a trip taken by a vehicle
 */
@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trip_vehicle", columnList = "vehicle_id"),
    @Index(name = "idx_trip_driver", columnList = "driver_id"),
    @Index(name = "idx_trip_status", columnList = "status"),
    @Index(name = "idx_trip_type", columnList = "type"),
    @Index(name = "idx_trip_scheduled_start", columnList = "scheduled_start_time")
})
@Getter
@Setter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(name = "driver_id")
    private UUID driverId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TripType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TripStatus status = TripStatus.SCHEDULED;

    // Location fields using embedded objects
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "latitude", column = @Column(name = "start_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "start_longitude")),
        @AttributeOverride(name = "address", column = @Column(name = "start_address")),
        @AttributeOverride(name = "city", column = @Column(name = "start_city")),
        @AttributeOverride(name = "state", column = @Column(name = "start_state")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "start_zip_code"))
    })
    private Location startLocation;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "latitude", column = @Column(name = "end_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "end_longitude")),
        @AttributeOverride(name = "address", column = @Column(name = "end_address")),
        @AttributeOverride(name = "city", column = @Column(name = "end_city")),
        @AttributeOverride(name = "state", column = @Column(name = "end_state")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "end_zip_code"))
    })
    private Location endLocation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "waypoints", columnDefinition = "json")
    @Builder.Default
    private List<LocationDTO> waypoints = new ArrayList<>();

    // Time fields
    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @NotNull
    @Column(name = "scheduled_start_time", nullable = false)
    private LocalDateTime scheduledStartTime;

    @Column(name = "scheduled_end_time")
    private LocalDateTime scheduledEndTime;


    @PositiveOrZero
    @Column(name = "distance", precision = 10, scale = 2)
    private BigDecimal distance;

    @PositiveOrZero
    @Column(name = "duration")
    private Integer duration;

    @PositiveOrZero
    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    // Financial fields
    @PositiveOrZero
    @Column(name = "base_rate", precision = 10, scale = 2)
    private BigDecimal baseRate;

    @PositiveOrZero
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @PositiveOrZero
    @Column(name = "fuel_cost", precision = 10, scale = 2)
    private BigDecimal fuelCost;

    @PositiveOrZero
    @Column(name = "additional_fees", precision = 10, scale = 2)
    private BigDecimal additionalFees;

    // Notes fields
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
