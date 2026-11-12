package com.pcd.shared.events;

import java.time.Instant;
import java.util.UUID;

public record GeofenceEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID alertId,
        UUID geofenceId,
        String geofenceName,
        UUID vehicleId,
        Severity severity,
        double latitude,
        double longitude,
        double speedKph,
        Double speedLimitKph) {

    public enum Type {
        VEHICLE_ENTERED,
        VEHICLE_EXITED,
        SPEED_LIMIT_EXCEEDED
    }

    public enum Severity {
        INFO,
        WARNING,
        CRITICAL
    }
}
