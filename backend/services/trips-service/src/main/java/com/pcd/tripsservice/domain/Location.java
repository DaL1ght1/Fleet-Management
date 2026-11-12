package com.pcd.tripsservice.domain;

import java.util.Objects;

public record Location(
        double latitude,
        double longitude,
        String address,
        String city,
        String state,
        String zipCode) {

    private static final double MAX_LATITUDE = 90;
    private static final double MAX_LONGITUDE = 180;

    public Location {
        if (Math.abs(latitude) > MAX_LATITUDE) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (Math.abs(longitude) > MAX_LONGITUDE) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (Objects.requireNonNull(address, "address is required").isBlank()) {
            throw new IllegalArgumentException("Address must not be blank");
        }
    }
}
