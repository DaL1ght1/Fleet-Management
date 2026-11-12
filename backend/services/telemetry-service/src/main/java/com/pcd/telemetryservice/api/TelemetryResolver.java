package com.pcd.telemetryservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.shared.security.ManagerOrAdmin;
import com.pcd.shared.security.Staff;
import com.pcd.telemetryservice.api.graphql.types.DeviceRegistration;
import com.pcd.telemetryservice.api.graphql.types.TelemetryDevice;
import com.pcd.telemetryservice.api.graphql.types.TrackPoint;
import com.pcd.telemetryservice.api.graphql.types.Vehicle;
import com.pcd.telemetryservice.api.graphql.types.VehiclePosition;
import com.pcd.telemetryservice.application.DeviceService;
import com.pcd.telemetryservice.application.PositionQueryService;
import lombok.RequiredArgsConstructor;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class TelemetryResolver {

    private final PositionQueryService positions;
    private final DeviceService devices;
    private final TelemetryGraphQlMapper mapper;
    private final Clock clock;

    @DgsQuery
    @Staff
    public List<VehiclePosition> vehiclePositions() {
        return positions.fleet().stream()
                .map(position -> mapper.toGraphQl(position, clock.instant(), positions.staleAfter()))
                .toList();
    }

    @DgsData(parentType = "Vehicle", field = "lastPosition")
    @Staff
    public VehiclePosition lastPosition(DgsDataFetchingEnvironment environment) {
        return positions.latest(vehicleId(environment))
                .map(position -> mapper.toGraphQl(position, clock.instant(), positions.staleAfter()))
                .orElse(null);
    }

    @DgsData(parentType = "Vehicle", field = "track")
    @Staff
    public List<TrackPoint> track(DgsDataFetchingEnvironment environment, @InputArgument OffsetDateTime from,
                                  @InputArgument OffsetDateTime to) {
        return positions.track(vehicleId(environment), from.toInstant(), to.toInstant()).stream()
                .map(mapper::toTrackPoint)
                .toList();
    }

    @DgsData(parentType = "Vehicle", field = "telemetryDevices")
    @ManagerOrAdmin
    public List<TelemetryDevice> telemetryDevices(DgsDataFetchingEnvironment environment) {
        return devices.forVehicle(vehicleId(environment)).stream().map(mapper::toGraphQl).toList();
    }

    @DgsMutation
    @ManagerOrAdmin
    public DeviceRegistration registerTelemetryDevice(@InputArgument UUID vehicleId, @InputArgument String label) {
        DeviceService.Registration registration = devices.register(vehicleId, label);
        return DeviceRegistration.newBuilder()
                .device(mapper.toGraphQl(registration.device()))
                .apiKey(registration.key().value())
                .build();
    }

    @DgsMutation
    @ManagerOrAdmin
    public TelemetryDevice revokeTelemetryDevice(@InputArgument UUID id) {
        return mapper.toGraphQl(devices.revoke(id));
    }

    @DgsEntityFetcher(name = "Vehicle")
    public Vehicle vehicleReference(Map<String, Object> representation) {
        return mapper.vehicleReference(UUID.fromString(String.valueOf(representation.get("id"))));
    }

    private static UUID vehicleId(DgsDataFetchingEnvironment environment) {
        return environment.<Vehicle>getSource().getId();
    }
}
