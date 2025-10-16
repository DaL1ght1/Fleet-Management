package com.pcd.vehicles.Configuration;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.pcd.vehicles.Entity.Vehicle;
import com.pcd.vehicles.Service.VehicleServices;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class VehicleEntityFetcher {
    private final VehicleServices vehicleService;
    @DgsEntityFetcher(name = "Vehicle")
    public Vehicle fetch(Map<String, Object> values) {
        UUID id = UUID.fromString((String) values.get("id"));
        return vehicleService.findById(id);
    }
}