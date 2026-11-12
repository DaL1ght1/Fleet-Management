package com.pcd.tripsservice.application;

import java.math.BigDecimal;

public record TripCompletion(BigDecimal distanceKm, BigDecimal fuelCost, BigDecimal additionalFees) {
}
