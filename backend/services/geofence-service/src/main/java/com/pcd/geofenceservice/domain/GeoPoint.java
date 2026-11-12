package com.pcd.geofenceservice.domain;

public record GeoPoint(double latitude, double longitude) {

    private static final double EARTH_RADIUS_METERS = 6_371_000;

    public GeoPoint {
        if (Math.abs(latitude) > 90) {
            throw new IllegalArgumentException("latitude must be between -90 and 90");
        }
        if (Math.abs(longitude) > 180) {
            throw new IllegalArgumentException("longitude must be between -180 and 180");
        }
    }

    public double distanceMetersTo(GeoPoint other) {
        double dLatitude = Math.toRadians(other.latitude - latitude);
        double dLongitude = Math.toRadians(other.longitude - longitude);
        double a = Math.pow(Math.sin(dLatitude / 2), 2)
                + Math.cos(Math.toRadians(latitude)) * Math.cos(Math.toRadians(other.latitude))
                * Math.pow(Math.sin(dLongitude / 2), 2);
        return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
    }
}
