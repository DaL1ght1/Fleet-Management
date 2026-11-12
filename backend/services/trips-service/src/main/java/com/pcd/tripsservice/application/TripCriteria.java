package com.pcd.tripsservice.application;

import com.pcd.tripsservice.domain.TripStatus;
import com.pcd.tripsservice.domain.TripType;

import java.time.Instant;
import java.util.UUID;

public record TripCriteria(
        TripStatus status,
        TripType type,
        UUID vehicleId,
        UUID driverId,
        UUID customerId,
        Instant scheduledFrom,
        Instant scheduledTo) {

    public static final TripCriteria ANY = new TripCriteria(null, null, null, null, null, null, null);
}
