package com.pcd.tripsservice.Configuration;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.pcd.tripsservice.Service.UserServiceClient;
import com.pcd.tripsservice.Service.VehicleServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.UUID;

/**
 * Entity fetchers for Apollo Federation - resolves external entities
 */
@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class EntityFetchers {

    private final UserServiceClient userServiceClient;
    private final VehicleServiceClient vehicleServiceClient;

    /**
     * Fetches User entity by ID for federation
     */
    @DgsEntityFetcher(name = "User")
    public Object fetchUser(Map<String, Object> values) {
        try {
            UUID userId = UUID.fromString((String) values.get("id"));
            log.debug("Fetching User entity with id: {}", userId);
            return userServiceClient.getUserById(userId);
        } catch (Exception e) {
            log.error("Error fetching User entity: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Fetches Vehicle entity by ID for federation
     */
    @DgsEntityFetcher(name = "Vehicle")
    public Object fetchVehicle(Map<String, Object> values) {
        try {
            UUID vehicleId = UUID.fromString((String) values.get("id"));
            log.debug("Fetching Vehicle entity with id: {}", vehicleId);
            return vehicleServiceClient.getVehicleById(vehicleId);
        } catch (Exception e) {
            log.error("Error fetching Vehicle entity: {}", e.getMessage(), e);
            return null;
        }
    }
}
