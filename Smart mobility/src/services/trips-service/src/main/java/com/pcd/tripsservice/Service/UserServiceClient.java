package com.pcd.tripsservice.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Client service for communicating with User Service
 * Implements caching and fallback mechanisms
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final WebClient.Builder webClientBuilder;
    
    @Value("${services.user-service.url:http://user-service:8080}")
    private String userServiceUrl;
    
    // Simple in-memory cache for users
    private final Map<UUID, Object> userCache = new ConcurrentHashMap<>();
    private final Map<UUID, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 300_000; // 5 minutes

    /**
     * Get user by ID with caching
     */
    public Object getUserById(UUID userId) {
        try {
            // Check cache first
            Object cachedUser = getCachedUser(userId);
            if (cachedUser != null) {
                return cachedUser;
            }

            // Fetch from service
            WebClient webClient = webClientBuilder
                .baseUrl(userServiceUrl)
                .build();

            Object response = webClient
                .post()
                .uri("/graphql")
                .bodyValue(createUserQuery(userId))
                .retrieve()
                .bodyToMono(Object.class)
                .doOnError(error -> log.error("Error fetching user {}: {}", userId, error.getMessage()))
                .block(); // For synchronous federation

            // Parse GraphQL response
            Object userData = parseGraphQLResponse(response);
            if (userData != null) {
                cacheUser(userId, userData);
                return userData;
            } else {
                log.warn("User {} not found in user service", userId);
                return null; // Return null for non-existent users instead of fallback
            }
            
        } catch (Exception e) {
            log.error("Failed to fetch user {}: {}", userId, e.getMessage(), e);
            return null; // Return null instead of fallback to avoid federation issues
        }
    }

    /**
     * Parse GraphQL response and extract user data
     */
    @SuppressWarnings("unchecked")
    private Object parseGraphQLResponse(Object response) {
        try {
            if (response instanceof Map) {
                Map<String, Object> responseMap = (Map<String, Object>) response;
                
                // Check for errors first
                if (responseMap.containsKey("errors")) {
                    log.debug("GraphQL errors in user response: {}", responseMap.get("errors"));
                    return null;
                }
                
                // Extract data
                if (responseMap.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) responseMap.get("data");
                    if (data != null && data.containsKey("getUserById")) {
                        return data.get("getUserById");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing GraphQL response: {}", e.getMessage(), e);
        }
        return null;
    }

    /**
     * Creates GraphQL query for user
     */
    private Map<String, Object> createUserQuery(UUID userId) {
        String query = """
            query GetUser($id: UUID!) {
                getUserById(id: $id) {
                    id
                    firstName
                    lastName
                    email
                    phoneNumber
                    licenseNumber
                    createdAt
                    updatedAt
                }
            }
        """;
        
        return Map.of(
            "query", query,
            "variables", Map.of("id", userId.toString())
        );
    }

    /**
     * Get cached user if still valid
     */
    private Object getCachedUser(UUID userId) {
        Long timestamp = cacheTimestamps.get(userId);
        if (timestamp != null && (System.currentTimeMillis() - timestamp) < CACHE_TTL_MS) {
            return userCache.get(userId);
        }
        return null;
    }

    /**
     * Cache user data
     */
    private void cacheUser(UUID userId, Object user) {
        if (user != null) {
            userCache.put(userId, user);
            cacheTimestamps.put(userId, System.currentTimeMillis());
        }
    }

    /**
     * Fallback response when user service is unavailable
     */
    private Object createUserFallback(UUID userId) {
        return Map.of(
            "id", userId.toString(),
            "firstName", "Unknown",
            "lastName", "User",
            "email", "unknown@example.com",
            "phoneNumber", "",
            "licenseNumber", "",
            "createdAt", "",
            "updatedAt", ""
        );
    }

    /**
     * Clear cache entry
     */
    public void clearUserCache(UUID userId) {
        userCache.remove(userId);
        cacheTimestamps.remove(userId);
    }
}
