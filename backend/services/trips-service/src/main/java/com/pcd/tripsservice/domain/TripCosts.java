package com.pcd.tripsservice.domain;

import jakarta.persistence.Embeddable;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.stream.Stream;

@Embeddable
public record TripCosts(BigDecimal baseRate, BigDecimal fuelCost, BigDecimal additionalFees) {

    public static final TripCosts NONE = new TripCosts(null, null, null);

    public TripCosts {
        Stream.of(baseRate, fuelCost, additionalFees)
                .filter(Objects::nonNull)
                .filter(amount -> amount.signum() < 0)
                .findAny()
                .ifPresent(negative -> {
                    throw new IllegalArgumentException("Trip costs must not be negative");
                });
    }

    public BigDecimal total() {
        return Stream.of(baseRate, fuelCost, additionalFees)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public TripCosts withActuals(BigDecimal actualFuelCost, BigDecimal actualAdditionalFees) {
        return new TripCosts(baseRate,
                actualFuelCost != null ? actualFuelCost : fuelCost,
                actualAdditionalFees != null ? actualAdditionalFees : additionalFees);
    }
}
