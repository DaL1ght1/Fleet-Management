package com.pcd.geofenceservice.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;
import java.util.Objects;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = GeofenceShape.Polygon.class, name = "polygon"),
        @JsonSubTypes.Type(value = GeofenceShape.Circle.class, name = "circle")
})
public sealed interface GeofenceShape {

    boolean contains(GeoPoint point);

    record Polygon(List<GeoPoint> vertices) implements GeofenceShape {

        private static final int MIN_VERTICES = 3;
        private static final int MAX_VERTICES = 500;

        public Polygon {
            Objects.requireNonNull(vertices, "polygon is required");
            if (vertices.size() < MIN_VERTICES || vertices.size() > MAX_VERTICES) {
                throw new IllegalArgumentException("A polygon needs between %d and %d points"
                        .formatted(MIN_VERTICES, MAX_VERTICES));
            }
            vertices = List.copyOf(vertices);
        }

        @Override
        public boolean contains(GeoPoint point) {
            boolean inside = false;
            for (int current = 0, previous = vertices.size() - 1; current < vertices.size(); previous = current++) {
                GeoPoint a = vertices.get(current);
                GeoPoint b = vertices.get(previous);
                boolean crosses = (a.latitude() > point.latitude()) != (b.latitude() > point.latitude())
                        && point.longitude() < (b.longitude() - a.longitude())
                        * (point.latitude() - a.latitude()) / (b.latitude() - a.latitude()) + a.longitude();
                if (crosses) {
                    inside = !inside;
                }
            }
            return inside;
        }
    }

    record Circle(GeoPoint center, double radiusMeters) implements GeofenceShape {

        private static final double MIN_RADIUS_METERS = 10;
        private static final double MAX_RADIUS_METERS = 200_000;

        public Circle {
            Objects.requireNonNull(center, "center is required");
            if (radiusMeters < MIN_RADIUS_METERS || radiusMeters > MAX_RADIUS_METERS) {
                throw new IllegalArgumentException("radiusMeters must be between %.0f and %.0f"
                        .formatted(MIN_RADIUS_METERS, MAX_RADIUS_METERS));
            }
        }

        @Override
        public boolean contains(GeoPoint point) {
            return center.distanceMetersTo(point) <= radiusMeters;
        }
    }
}
