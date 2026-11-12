package com.pcd.tripsservice.domain;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TripFixtures {

    public static final Instant START = Instant.parse("2030-01-01T08:00:00Z");
    public static final Location ORIGIN = new Location(36.8065, 10.1815, "Avenue Habib Bourguiba", "Tunis", null, "1000");
    public static final Location DESTINATION = new Location(35.8256, 10.6084, "Route de la Corniche", "Sousse", null, "4000");

    private TripFixtures() {
    }

    public static TripPlan plan(UUID vehicleId, UUID driverId) {
        return plan(vehicleId, driverId, START, START.plus(Duration.ofHours(3)));
    }

    public static TripPlan plan(UUID vehicleId, UUID driverId, Instant start, Instant end) {
        return new TripPlan(TripType.RENTAL, vehicleId, driverId, null, ORIGIN, DESTINATION, List.of(), start, end, 150,
                new TripCosts(new BigDecimal("120.00"), null, null), "notes", null, null);
    }
}
