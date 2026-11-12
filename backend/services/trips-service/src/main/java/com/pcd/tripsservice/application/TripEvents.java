package com.pcd.tripsservice.application;

import com.pcd.shared.events.TripEvent;
import com.pcd.tripsservice.domain.Trip;

import java.time.Instant;
import java.util.UUID;

final class TripEvents {

    private TripEvents() {
    }

    static TripEvent of(TripEvent.Type type, Trip trip, Instant occurredAt) {
        return new TripEvent(
                UUID.randomUUID(),
                type,
                occurredAt,
                trip.getId(),
                trip.getVehicleId(),
                trip.getDriverId(),
                trip.getCustomerId(),
                TripEvent.Kind.valueOf(trip.getType().name()),
                TripEvent.Status.valueOf(trip.getStatus().name()),
                trip.getScheduledStart(),
                trip.getScheduledEnd(),
                trip.getStartedAt(),
                trip.getCompletedAt(),
                trip.getDistanceKm(),
                trip.getCosts().total(),
                trip.getCancellationReason());
    }
}
