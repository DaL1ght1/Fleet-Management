package com.pcd.geofenceservice.domain;

import java.util.Objects;

public record GeofenceDefinition(String name, GeofenceKind kind, GeofenceShape shape, Double speedLimitKph) {

    private static final int MAX_NAME_LENGTH = 100;
    private static final double MAX_SPEED_LIMIT_KPH = 200;

    public GeofenceDefinition {
        if (name == null || name.isBlank() || name.strip().length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException("name must be between 1 and %d characters".formatted(MAX_NAME_LENGTH));
        }
        name = name.strip();
        Objects.requireNonNull(kind, "kind is required");
        Objects.requireNonNull(shape, "A polygon or a circle is required");
        if (speedLimitKph != null && (speedLimitKph <= 0 || speedLimitKph > MAX_SPEED_LIMIT_KPH)) {
            throw new IllegalArgumentException("speedLimitKph must be between 1 and %.0f".formatted(MAX_SPEED_LIMIT_KPH));
        }
    }
}
