package com.pcd.vehiclesservice.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

public record VehicleSpecification(
        String make,
        String model,
        int year,
        String licensePlate,
        String vin,
        String color,
        long mileage,
        FuelType fuelType,
        int seatingCapacity,
        BigDecimal dailyRate,
        boolean gpsEnabled,
        LocalDate lastMaintenanceDate,
        int maintenanceIntervalDays) {

    private static final int FIRST_SUPPORTED_YEAR = 1950;
    private static final int MAX_SEATS = 100;
    private static final Pattern VIN_PATTERN = Pattern.compile("[A-HJ-NPR-Z0-9]{17}");

    public VehicleSpecification {
        make = requireText(make, "make");
        model = requireText(model, "model");
        color = requireText(color, "color");
        licensePlate = normalizePlate(licensePlate);
        vin = normalizeVin(vin);
        Objects.requireNonNull(fuelType, "fuelType is required");
        Objects.requireNonNull(lastMaintenanceDate, "lastMaintenanceDate is required");
        if (year < FIRST_SUPPORTED_YEAR || year > Year.now().getValue() + 1) {
            throw new IllegalArgumentException("year must be between %d and next year".formatted(FIRST_SUPPORTED_YEAR));
        }
        if (mileage < 0) {
            throw new IllegalArgumentException("mileage must not be negative");
        }
        if (seatingCapacity < 1 || seatingCapacity > MAX_SEATS) {
            throw new IllegalArgumentException("seatingCapacity must be between 1 and %d".formatted(MAX_SEATS));
        }
        if (Objects.requireNonNull(dailyRate, "dailyRate is required").signum() < 0) {
            throw new IllegalArgumentException("dailyRate must not be negative");
        }
        if (maintenanceIntervalDays < 1) {
            throw new IllegalArgumentException("maintenanceIntervalDays must be positive");
        }
    }

    static String normalizePlate(String plate) {
        return requireText(plate, "licensePlate").toUpperCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    static String normalizeVin(String vin) {
        String normalized = requireText(vin, "vin").toUpperCase(Locale.ROOT);
        if (!VIN_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("vin must be 17 characters without I, O or Q");
        }
        return normalized;
    }

    static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }
}
