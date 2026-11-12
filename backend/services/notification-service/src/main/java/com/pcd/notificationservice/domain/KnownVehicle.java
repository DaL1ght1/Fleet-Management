package com.pcd.notificationservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "known_vehicles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KnownVehicle {

    @Id
    private UUID id;

    private String label;

    private Instant lastEventAt;

    public static KnownVehicle track(UUID id) {
        KnownVehicle vehicle = new KnownVehicle();
        vehicle.id = id;
        vehicle.lastEventAt = Instant.EPOCH;
        return vehicle;
    }

    public void apply(Instant eventTime, String newLabel) {
        if (eventTime.isAfter(lastEventAt)) {
            lastEventAt = eventTime;
            label = newLabel;
        }
    }
}
