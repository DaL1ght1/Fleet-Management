package com.pcd.tripsservice.application;

import com.pcd.tripsservice.domain.Location;
import com.pcd.tripsservice.domain.TripType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record TripRequest(
        Location from,
        Location to,
        Instant departAt,
        BigDecimal routeDistanceKm,
        Integer routeDurationMinutes,
        TripType type,
        UUID vehicleId,
        UUID driverId,
        UUID customerId,
        String notes) {

    public TripRequest {
        Objects.requireNonNull(from, "from is required");
        Objects.requireNonNull(to, "to is required");
    }

    public boolean overridesAssignment() {
        return vehicleId != null || driverId != null || customerId != null;
    }

    public static TripRequest byCustomer(TripRequest request, UUID customerId) {
        return new TripRequest(request.from(), request.to(), request.departAt(), request.routeDistanceKm(),
                request.routeDurationMinutes(), TripType.RENTAL, null, null, customerId, request.notes());
    }
}
