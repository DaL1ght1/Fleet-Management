package com.pcd.tripsservice.application;

import com.pcd.tripsservice.domain.Location;
import com.pcd.tripsservice.domain.TripCosts;
import com.pcd.tripsservice.domain.TripPlan;
import com.pcd.tripsservice.domain.TripType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TripPlanChanges(
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

    public TripPlan applyTo(TripPlan current) {
        return new TripPlan(
                valueOr(type, current.type()),
                valueOr(vehicleId, current.vehicleId()),
                valueOr(driverId, current.driverId()),
                valueOr(customerId, current.customerId()),
                valueOr(startLocation, current.startLocation()),
                valueOr(endLocation, current.endLocation()),
                valueOr(waypoints, current.waypoints()),
                valueOr(scheduledStart, current.scheduledStart()),
                valueOr(scheduledEnd, current.scheduledEnd()),
                valueOr(estimatedDurationMinutes, current.estimatedDurationMinutes()),
                valueOr(costs, current.costs()),
                valueOr(notes, current.notes()),
                valueOr(customerNotes, current.customerNotes()),
                valueOr(internalNotes, current.internalNotes()));
    }

    private static <T> T valueOr(T candidate, T fallback) {
        return candidate != null ? candidate : fallback;
    }
}
