package com.pcd.telemetryservice.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

public record PositionReport(
        Instant recordedAt,
        double latitude,
        double longitude,
        double speedKph,
        Double headingDegrees,
        Double odometerKm,
        Double fuelLevelPercent,
        Boolean ignitionOn) {

    private static final double MAX_SPEED_KPH = 300;
    private static final double FULL_CIRCLE = 360;
    private static final double FULL_TANK = 100;
    private static final Duration CLOCK_SKEW_TOLERANCE = Duration.ofMinutes(2);

    public PositionReport {
        Objects.requireNonNull(recordedAt, "recordedAt is required");
        require(Math.abs(latitude) <= 90, "latitude must be between -90 and 90");
        require(Math.abs(longitude) <= 180, "longitude must be between -180 and 180");
        require(speedKph >= 0 && speedKph <= MAX_SPEED_KPH, "speedKph must be between 0 and 300");
        require(headingDegrees == null || (headingDegrees >= 0 && headingDegrees < FULL_CIRCLE),
                "headingDegrees must be between 0 and 360");
        require(odometerKm == null || odometerKm >= 0, "odometerKm must not be negative");
        require(fuelLevelPercent == null || (fuelLevelPercent >= 0 && fuelLevelPercent <= FULL_TANK),
                "fuelLevelPercent must be between 0 and 100");
    }

    public void ensureNotFromTheFuture(Instant now) {
        require(!recordedAt.isAfter(now.plus(CLOCK_SKEW_TOLERANCE)), "recordedAt must not be in the future");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalArgumentException(message);
        }
    }
}
