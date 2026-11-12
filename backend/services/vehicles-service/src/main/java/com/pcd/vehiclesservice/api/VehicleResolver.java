package com.pcd.vehiclesservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.shared.security.AdminOnly;
import com.pcd.shared.security.ManagerOrAdmin;
import com.pcd.shared.security.Staff;
import com.pcd.vehiclesservice.api.graphql.types.FleetStatistics;
import com.pcd.vehiclesservice.api.graphql.types.RegisterVehicleInput;
import com.pcd.vehiclesservice.api.graphql.types.UpdateVehicleInput;
import com.pcd.vehiclesservice.api.graphql.types.Vehicle;
import com.pcd.vehiclesservice.api.graphql.types.VehicleFilter;
import com.pcd.vehiclesservice.api.graphql.types.VehiclePage;
import com.pcd.vehiclesservice.api.graphql.types.VehicleStatus;
import com.pcd.vehiclesservice.application.VehicleCriteria;
import com.pcd.vehiclesservice.application.VehicleService;
import lombok.RequiredArgsConstructor;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class VehicleResolver {

    private final VehicleService vehicleService;
    private final VehicleGraphQlMapper mapper;
    private final Clock clock;

    @DgsQuery
    @Staff
    public Vehicle vehicle(@InputArgument UUID id) {
        return vehicleService.find(id).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @Staff
    public Vehicle vehicleByLicensePlate(@InputArgument String licensePlate) {
        return vehicleService.findByLicensePlate(licensePlate).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @Staff
    public Vehicle vehicleByVin(@InputArgument String vin) {
        return vehicleService.findByVin(vin).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @Staff
    public VehiclePage vehicles(@InputArgument VehicleFilter filter, @InputArgument Integer page,
                                @InputArgument Integer size) {
        VehicleCriteria criteria = filter == null ? VehicleCriteria.ANY : mapper.toCriteria(filter);
        return mapper.toGraphQl(vehicleService.search(criteria, page, size), today());
    }

    @DgsQuery
    @Staff
    public FleetStatistics fleetStatistics() {
        return mapper.toGraphQl(vehicleService.statistics());
    }

    @DgsMutation
    @ManagerOrAdmin
    public Vehicle registerVehicle(@InputArgument RegisterVehicleInput input) {
        return toGraphQl(vehicleService.register(mapper.toSpecification(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Vehicle updateVehicle(@InputArgument UUID id, @InputArgument UpdateVehicleInput input) {
        return toGraphQl(vehicleService.update(id, mapper.toChanges(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Vehicle changeVehicleStatus(@InputArgument UUID id, @InputArgument VehicleStatus status) {
        return toGraphQl(vehicleService.changeStatus(id,
                com.pcd.vehiclesservice.domain.VehicleStatus.valueOf(status.name())));
    }

    @DgsMutation
    @Staff
    public Vehicle recordOdometerReading(@InputArgument UUID id, @InputArgument Long mileage) {
        return toGraphQl(vehicleService.recordOdometerReading(id, mileage));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Vehicle completeMaintenance(@InputArgument UUID id, @InputArgument LocalDate date) {
        return toGraphQl(vehicleService.completeMaintenance(id, date));
    }

    @DgsMutation
    @AdminOnly
    public boolean deleteVehicle(@InputArgument UUID id) {
        vehicleService.delete(id);
        return true;
    }

    @DgsEntityFetcher(name = "Vehicle")
    public Vehicle vehicleReference(Map<String, Object> representation) {
        return vehicleService.find(UUID.fromString(String.valueOf(representation.get("id"))))
                .map(this::toGraphQl)
                .orElse(null);
    }

    private Vehicle toGraphQl(com.pcd.vehiclesservice.domain.Vehicle vehicle) {
        return mapper.toGraphQl(vehicle, today());
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
