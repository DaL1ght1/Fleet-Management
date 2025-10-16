package com.pcd.tripsservice.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Location DTO for JSON serialization in waypoints
 * This is used for storing Location data as JSON in the database
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("address")
    private String address;

    @JsonProperty("city")
    private String city;

    @JsonProperty("state")
    private String state;

    @JsonProperty("zipCode")
    private String zipCode;

    /**
     * Convert from Location entity to LocationDTO
     */
    public static LocationDTO fromLocation(Location location) {
        if (location == null) {
            return null;
        }
        return LocationDTO.builder()
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .address(location.getAddress())
                .city(location.getCity())
                .state(location.getState())
                .zipCode(location.getZipCode())
                .build();
    }

    /**
     * Convert from LocationDTO to Location entity
     */
    public Location toLocation() {
        return Location.builder()
                .latitude(this.latitude)
                .longitude(this.longitude)
                .address(this.address)
                .city(this.city)
                .state(this.state)
                .zipCode(this.zipCode)
                .build();
    }
}