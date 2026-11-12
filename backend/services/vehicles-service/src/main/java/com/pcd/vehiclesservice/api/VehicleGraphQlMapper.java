package com.pcd.vehiclesservice.api;

import com.pcd.vehiclesservice.api.graphql.types.FleetStatistics;
import com.pcd.vehiclesservice.api.graphql.types.RegisterVehicleInput;
import com.pcd.vehiclesservice.api.graphql.types.UpdateVehicleInput;
import com.pcd.vehiclesservice.api.graphql.types.VehicleFilter;
import com.pcd.vehiclesservice.api.graphql.types.VehiclePage;
import com.pcd.vehiclesservice.application.VehicleCriteria;
import com.pcd.vehiclesservice.domain.Vehicle;
import com.pcd.vehiclesservice.domain.VehicleChanges;
import com.pcd.vehiclesservice.domain.VehicleSpecification;
import com.pcd.vehiclesservice.domain.VehicleStatus;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Mapper
public interface VehicleGraphQlMapper {

    @Mapping(target = "maintenanceDue", expression = "java(vehicle.isMaintenanceDue(today))")
    @Mapping(target = "inUse", expression = "java(vehicle.isInUse())")
    com.pcd.vehiclesservice.api.graphql.types.Vehicle toGraphQl(Vehicle vehicle, @Context LocalDate today);

    default VehiclePage toGraphQl(Page<Vehicle> page, LocalDate today) {
        return VehiclePage.newBuilder()
                .items(page.getContent().stream().map(vehicle -> toGraphQl(vehicle, today)).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default FleetStatistics toGraphQl(com.pcd.vehiclesservice.application.FleetStatistics statistics) {
        return FleetStatistics.newBuilder()
                .total(Math.toIntExact(statistics.total()))
                .active(Math.toIntExact(statistics.count(VehicleStatus.ACTIVE)))
                .inactive(Math.toIntExact(statistics.count(VehicleStatus.INACTIVE)))
                .inMaintenance(Math.toIntExact(statistics.count(VehicleStatus.MAINTENANCE)))
                .inUse(Math.toIntExact(statistics.inUse()))
                .maintenanceDue(Math.toIntExact(statistics.maintenanceDue()))
                .build();
    }

    VehicleSpecification toSpecification(RegisterVehicleInput input);

    VehicleChanges toChanges(UpdateVehicleInput input);

    VehicleCriteria toCriteria(VehicleFilter filter);

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }
}
