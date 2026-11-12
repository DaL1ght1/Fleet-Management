package com.pcd.shared.events;

import java.time.Instant;
import java.util.UUID;

public record VehiclePositionEvent(
        UUID eventId,
        Instant occurredAt,
        UUID vehicleId,
        UUID deviceId,
        Instant recordedAt,
        double latitude,
        double longitude,
        double speedKph,
        Double headingDegrees,
        Double odometerKm,
        Double fuelLevelPercent,
        Boolean ignitionOn) {
}
