package com.pcd.shared.events;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record VehicleEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID vehicleId,
        String licensePlate,
        String make,
        String model,
        Status status,
        Long mileage,
        LocalDate nextMaintenanceDate) {

    public enum Type {
        VEHICLE_REGISTERED,
        VEHICLE_UPDATED,
        VEHICLE_STATUS_CHANGED,
        VEHICLE_MILEAGE_RECORDED,
        VEHICLE_DELETED
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        MAINTENANCE
    }
}
