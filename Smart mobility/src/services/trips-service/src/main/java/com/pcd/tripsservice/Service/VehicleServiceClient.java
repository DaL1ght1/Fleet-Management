package com.pcd.tripsservice.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
/**
 * Client service for communicating with Vehicle Service
 * Implements caching and fallback mechanisms
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleServiceClient {

    private final WebClient.Builder webClientBuilder;
    
    @Value("${services.vehicle-service.url:http://vehicles-service:8080}")
    private String vehicleServiceUrl;
    
    // Simple in-memory cache for vehicles
    private final Map<UUID, Object> vehicleCache = new ConcurrentHashMap<>();
    private final Map<UUID, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 300_000; // 5 minutes

    /**
     * Get vehicle by ID with caching
     */
    public Object getVehicleById(UUID vehicleId) {
        try {
            // Check cache first
            Object cachedVehicle = getCachedVehicle(vehicleId);
            if (cachedVehicle != null) {
                return cachedVehicle;
            }

            // Fetch from service
            WebClient webClient = webClientBuilder
                .baseUrl(vehicleServiceUrl)
                .build();

            Mono<Object> vehicleMono = webClient
                .post()
                .uri("/graphql")
                .bodyValue(createVehicleQuery(vehicleId))
                .retrieve()
                .bodyToMono(Object.class)
                .doOnNext(vehicle -> cacheVehicle(vehicleId, vehicle))
                .doOnError(error -> log.error("Error fetching vehicle {}: {}", vehicleId, error.getMessage()));

            return vehicleMono.block(); // For synchronous federation
            
        } catch (Exception e) {
            log.error("Failed to fetch vehicle {}: {}", vehicleId, e.getMessage(), e);
            return createVehicleFallback(vehicleId);
        }
    }

    /**
     * Creates GraphQL query for vehicle
     */
    private Map<String, Object> createVehicleQuery(UUID vehicleId) {
        String query = """
            query GetVehicle($id: UUID!) {
                getVehicleById(id: $id) {
                    data {
                        id
                        make
                        model
                        year
                        licensePlate
                        status
                        vin
                        color
                        mileage
                        fuelType
                        seatingCapacity
                        rentalPricePerDay
                        gpsEnabled
                        lastMaintenanceDate
                        maintenanceIntervalDays
                        nextMaintenanceDate
                    }
                }
            }
        """;
        
        return Map.of(
            "query", query,
            "variables", Map.of("id", vehicleId.toString())
        );
    }

    /**
     * Get cached vehicle if still valid
     */
    private Object getCachedVehicle(UUID vehicleId) {
        Long timestamp = cacheTimestamps.get(vehicleId);
        if (timestamp != null && (System.currentTimeMillis() - timestamp) < CACHE_TTL_MS) {
            return vehicleCache.get(vehicleId);
        }
        return null;
    }

    /**
     * Cache vehicle data
     */
    private void cacheVehicle(UUID vehicleId, Object vehicle) {
        if (vehicle != null) {
            vehicleCache.put(vehicleId, vehicle);
            cacheTimestamps.put(vehicleId, System.currentTimeMillis());
        }
    }

    /**
     * Fallback response when vehicle service is unavailable
     */
    private Object createVehicleFallback(UUID vehicleId) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("id", vehicleId.toString());
        fallback.put("make", "Unknown");
        fallback.put("model", "Unknown");
        fallback.put("year", 0);
        fallback.put("licensePlate", "UNKNOWN");
        fallback.put("status", "INACTIVE");
        fallback.put("vin", "UNKNOWN");
        fallback.put("color", "Unknown");
        fallback.put("mileage", 0L);
        fallback.put("fuelType", "GASOLINE");
        fallback.put("seatingCapacity", 0);
        fallback.put("rentalPricePerDay", 0L);
        fallback.put("gpsEnabled", false);
        fallback.put("lastMaintenanceDate", "");
        fallback.put("maintenanceIntervalDays", 0);
        fallback.put("nextMaintenanceDate", "");
        return fallback;
    }

    /**
     * Clear cache entry
     */
    public void clearVehicleCache(UUID vehicleId) {
        vehicleCache.remove(vehicleId);
        cacheTimestamps.remove(vehicleId);
    }
}
