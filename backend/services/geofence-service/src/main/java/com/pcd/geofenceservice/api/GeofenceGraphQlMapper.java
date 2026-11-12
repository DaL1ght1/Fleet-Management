package com.pcd.geofenceservice.api;

import com.pcd.geofenceservice.api.graphql.types.GeofenceAlertFilter;
import com.pcd.geofenceservice.api.graphql.types.GeofenceAlertPage;
import com.pcd.geofenceservice.api.graphql.types.GeofenceInput;
import com.pcd.geofenceservice.api.graphql.types.GeoPointInput;
import com.pcd.geofenceservice.api.graphql.types.Vehicle;
import com.pcd.geofenceservice.application.AlertCriteria;
import com.pcd.geofenceservice.domain.GeoPoint;
import com.pcd.geofenceservice.domain.Geofence;
import com.pcd.geofenceservice.domain.GeofenceAlert;
import com.pcd.geofenceservice.domain.GeofenceDefinition;
import com.pcd.geofenceservice.domain.GeofenceKind;
import com.pcd.geofenceservice.domain.GeofenceShape;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Mapper
public interface GeofenceGraphQlMapper {

    @Mapping(target = "vehicle", expression = "java(vehicleReference(alert.getVehicleId()))")
    @Mapping(target = "geofence", ignore = true)
    @Mapping(target = "acknowledged", expression = "java(alert.isAcknowledged())")
    com.pcd.geofenceservice.api.graphql.types.GeofenceAlert toGraphQl(GeofenceAlert alert);

    com.pcd.geofenceservice.api.graphql.types.GeoPoint toGraphQl(GeoPoint point);

    AlertCriteria toCriteria(GeofenceAlertFilter filter);

    default com.pcd.geofenceservice.api.graphql.types.Geofence toGraphQl(Geofence geofence, long vehiclesInside) {
        com.pcd.geofenceservice.api.graphql.types.Geofence.Builder builder =
                com.pcd.geofenceservice.api.graphql.types.Geofence.newBuilder()
                        .id(geofence.getId())
                        .name(geofence.getName())
                        .kind(com.pcd.geofenceservice.api.graphql.types.GeofenceKind.valueOf(geofence.getKind().name()))
                        .active(geofence.isActive())
                        .speedLimitKph(geofence.getSpeedLimitKph())
                        .vehiclesInside(Math.toIntExact(vehiclesInside))
                        .createdAt(toOffsetDateTime(geofence.getCreatedAt()))
                        .updatedAt(toOffsetDateTime(geofence.getUpdatedAt()));
        switch (geofence.getShape()) {
            case GeofenceShape.Polygon polygon -> builder.polygon(polygon.vertices().stream().map(this::toGraphQl).toList());
            case GeofenceShape.Circle circle -> builder.center(toGraphQl(circle.center())).radiusMeters(circle.radiusMeters());
        }
        return builder.build();
    }

    default GeofenceAlertPage toAlertPage(Page<GeofenceAlert> page) {
        return GeofenceAlertPage.newBuilder()
                .items(page.getContent().stream().map(this::toGraphQl).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default GeofenceDefinition toDefinition(GeofenceInput input) {
        boolean hasPolygon = input.getPolygon() != null && !input.getPolygon().isEmpty();
        boolean hasCircle = input.getCenter() != null || input.getRadiusMeters() != null;
        if (hasPolygon == hasCircle) {
            throw new IllegalArgumentException("Provide either a polygon or a center with a radius");
        }
        GeofenceShape shape = hasPolygon
                ? new GeofenceShape.Polygon(input.getPolygon().stream().map(this::toDomain).toList())
                : new GeofenceShape.Circle(toDomain(input.getCenter()), requireRadius(input.getRadiusMeters()));
        return new GeofenceDefinition(input.getName(), GeofenceKind.valueOf(input.getKind().name()), shape,
                input.getSpeedLimitKph());
    }

    default GeoPoint toDomain(GeoPointInput input) {
        if (input == null) {
            throw new IllegalArgumentException("center is required for a circle");
        }
        return new GeoPoint(input.getLatitude(), input.getLongitude());
    }

    default Vehicle vehicleReference(UUID id) {
        return Vehicle.newBuilder().id(id).build();
    }

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }

    private static double requireRadius(Double radius) {
        if (radius == null) {
            throw new IllegalArgumentException("radiusMeters is required for a circle");
        }
        return radius;
    }
}
