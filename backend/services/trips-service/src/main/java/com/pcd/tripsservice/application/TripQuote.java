package com.pcd.tripsservice.application;

import java.math.BigDecimal;
import java.time.Instant;

public record TripQuote(BigDecimal distanceKm, int durationMinutes, Instant departAt, Instant arriveAt,
                        BigDecimal price, boolean vehicleAvailable) {
}
