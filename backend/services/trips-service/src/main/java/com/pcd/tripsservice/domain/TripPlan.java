package com.pcd.tripsservice.domain;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public record TripPlan(
        TripType type,
        UUID vehicleId,
        UUID driverId,
        UUID customerId,
        Location startLocation,
        Location endLocation,
        List<Location> waypoints,
        Instant scheduledStart,
        Instant scheduledEnd,
        Integer estimatedDurationMinutes,
        TripCosts costs,
        String notes,
        String customerNotes,
        String internalNotes) {

    public TripPlan {
        Objects.requireNonNull(type, "type is required");
        Objects.requireNonNull(vehicleId, "vehicleId is required");
        Objects.requireNonNull(startLocation, "startLocation is required");
        Objects.requireNonNull(endLocation, "endLocation is required");
        Objects.requireNonNull(scheduledStart, "scheduledStart is required");
        Objects.requireNonNull(scheduledEnd, "scheduledEnd is required");
        if (!scheduledEnd.isAfter(scheduledStart)) {
            throw new IllegalArgumentException("scheduledEnd must be after scheduledStart");
        }
        if (estimatedDurationMinutes != null && estimatedDurationMinutes < 0) {
            throw new IllegalArgumentException("estimatedDurationMinutes must not be negative");
        }
        waypoints = waypoints == null ? List.of() : List.copyOf(waypoints);
        costs = costs == null ? TripCosts.NONE : costs;
    }
}
