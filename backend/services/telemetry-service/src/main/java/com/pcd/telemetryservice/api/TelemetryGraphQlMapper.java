package com.pcd.telemetryservice.api;

import com.pcd.telemetryservice.api.graphql.types.TelemetryDevice;
import com.pcd.telemetryservice.api.graphql.types.TrackPoint;
import com.pcd.telemetryservice.api.graphql.types.Vehicle;
import com.pcd.telemetryservice.api.graphql.types.VehiclePosition;
import com.pcd.telemetryservice.domain.Device;
import com.pcd.telemetryservice.domain.LatestPosition;
import com.pcd.telemetryservice.domain.Position;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Mapper
public interface TelemetryGraphQlMapper {

    @Mapping(target = "vehicle", expression = "java(vehicleReference(position.getVehicleId()))")
    @Mapping(target = "moving", expression = "java(position.isMoving())")
    @Mapping(target = "stale", expression = "java(position.isStale(now, staleAfter))")
    VehiclePosition toGraphQl(LatestPosition position, @Context Instant now, @Context Duration staleAfter);

    TrackPoint toTrackPoint(Position position);

    @Mapping(target = "revoked", expression = "java(device.isRevoked())")
    TelemetryDevice toGraphQl(Device device);

    default Vehicle vehicleReference(java.util.UUID id) {
        return Vehicle.newBuilder().id(id).build();
    }

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }
}
