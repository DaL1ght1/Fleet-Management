package com.pcd.vehiclesservice.domain;

import java.math.BigDecimal;

public record VehicleChanges(
        String make,
        String model,
        Integer year,
        String licensePlate,
        String color,
        FuelType fuelType,
        Integer seatingCapacity,
        BigDecimal dailyRate,
        Boolean gpsEnabled,
        Integer maintenanceIntervalDays) {

    VehicleSpecification applyTo(VehicleSpecification current) {
        return new VehicleSpecification(
                valueOr(make, current.make()),
                valueOr(model, current.model()),
                valueOr(year, current.year()),
                valueOr(licensePlate, current.licensePlate()),
                current.vin(),
                valueOr(color, current.color()),
                current.mileage(),
                valueOr(fuelType, current.fuelType()),
                valueOr(seatingCapacity, current.seatingCapacity()),
                valueOr(dailyRate, current.dailyRate()),
                valueOr(gpsEnabled, current.gpsEnabled()),
                current.lastMaintenanceDate(),
                valueOr(maintenanceIntervalDays, current.maintenanceIntervalDays()));
    }

    private static <T> T valueOr(T candidate, T fallback) {
        return candidate != null ? candidate : fallback;
    }
}
