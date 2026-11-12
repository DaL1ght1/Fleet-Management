package com.pcd.tripsservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "trips")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Trip {

    @Id
    private UUID id;

    @Version
    private long version;

    @Enumerated(EnumType.STRING)
    private TripType type;

    @Enumerated(EnumType.STRING)
    private TripStatus status;

    private UUID vehicleId;

    private UUID driverId;

    private UUID customerId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Location startLocation;

    @JdbcTypeCode(SqlTypes.JSON)
    private Location endLocation;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<Location> waypoints = new ArrayList<>();

    private Instant scheduledStart;

    private Instant scheduledEnd;

    private Instant startedAt;

    private Instant completedAt;

    private Integer estimatedDurationMinutes;

    private BigDecimal distanceKm;

    @Embedded
    private TripCosts costs;

    private String notes;

    private String customerNotes;

    private String internalNotes;

    private String cancellationReason;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Trip schedule(TripPlan plan) {
        Trip trip = new Trip();
        trip.id = UUID.randomUUID();
        trip.status = TripStatus.SCHEDULED;
        trip.applyPlan(plan);
        return trip;
    }

    public TripPlan plan() {
        return new TripPlan(type, vehicleId, driverId, customerId, startLocation, endLocation, waypoints, scheduledStart,
                scheduledEnd, estimatedDurationMinutes, getCosts(), notes, customerNotes, internalNotes);
    }

    public void reschedule(TripPlan plan) {
        requireStatus(Set.of(TripStatus.SCHEDULED), "rescheduled");
        applyPlan(plan);
    }

    public void start(Instant now) {
        requireStatus(Set.of(TripStatus.SCHEDULED), "started");
        status = TripStatus.IN_PROGRESS;
        startedAt = now;
    }

    public void complete(Instant now, BigDecimal travelledKm, BigDecimal fuelCost, BigDecimal additionalFees) {
        requireStatus(Set.of(TripStatus.IN_PROGRESS), "completed");
        if (Objects.requireNonNull(travelledKm, "distanceKm is required").signum() < 0) {
            throw new IllegalArgumentException("distanceKm must not be negative");
        }
        status = TripStatus.COMPLETED;
        completedAt = now;
        distanceKm = travelledKm;
        costs = getCosts().withActuals(fuelCost, additionalFees);
    }

    public void cancel(String reason) {
        requireStatus(TripStatus.ACTIVE, "cancelled");
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A cancellation reason is required");
        }
        status = TripStatus.CANCELLED;
        cancellationReason = reason.strip();
    }

    public void ensureDeletable() {
        if (status == TripStatus.IN_PROGRESS) {
            throw new BusinessRuleViolationException("Trip %s is in progress and cannot be deleted".formatted(id));
        }
    }

    public boolean isActive() {
        return TripStatus.ACTIVE.contains(status);
    }

    public TripCosts getCosts() {
        return costs == null ? TripCosts.NONE : costs;
    }

    public List<Location> getWaypoints() {
        return waypoints == null ? List.of() : List.copyOf(waypoints);
    }

    public Optional<Integer> actualDurationMinutes() {
        if (startedAt == null || completedAt == null) {
            return Optional.empty();
        }
        return Optional.of(Math.toIntExact(Duration.between(startedAt, completedAt).toMinutes()));
    }

    private void applyPlan(TripPlan plan) {
        type = plan.type();
        vehicleId = plan.vehicleId();
        driverId = plan.driverId();
        customerId = plan.customerId();
        startLocation = plan.startLocation();
        endLocation = plan.endLocation();
        waypoints = new ArrayList<>(plan.waypoints());
        scheduledStart = plan.scheduledStart();
        scheduledEnd = plan.scheduledEnd();
        estimatedDurationMinutes = plan.estimatedDurationMinutes();
        costs = plan.costs();
        notes = plan.notes();
        customerNotes = plan.customerNotes();
        internalNotes = plan.internalNotes();
    }

    private void requireStatus(Set<TripStatus> allowed, String action) {
        if (!allowed.contains(status)) {
            throw new BusinessRuleViolationException(
                    "Trip %s is %s and cannot be %s".formatted(id, status, action));
        }
    }
}
