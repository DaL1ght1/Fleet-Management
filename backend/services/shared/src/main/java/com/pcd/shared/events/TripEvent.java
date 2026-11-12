package com.pcd.shared.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TripEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID tripId,
        UUID vehicleId,
        UUID driverId,
        UUID customerId,
        Kind kind,
        Status status,
        Instant scheduledStart,
        Instant scheduledEnd,
        Instant startedAt,
        Instant completedAt,
        BigDecimal distanceKm,
        BigDecimal totalCost,
        String cancellationReason) {

    public enum Type {
        TRIP_SCHEDULED,
        TRIP_RESCHEDULED,
        TRIP_STARTED,
        TRIP_COMPLETED,
        TRIP_CANCELLED,
        TRIP_DELETED
    }

    public enum Kind {
        RENTAL,
        MAINTENANCE,
        RELOCATION,
        EMERGENCY
    }

    public enum Status {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
