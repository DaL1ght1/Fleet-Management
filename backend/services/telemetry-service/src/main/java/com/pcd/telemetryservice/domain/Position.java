package com.pcd.telemetryservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "positions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Position {

    @Id
    private UUID id;

    private UUID vehicleId;

    private UUID deviceId;

    private Instant recordedAt;

    private Instant receivedAt;

    private double latitude;

    private double longitude;

    private double speedKph;

    private Double headingDegrees;

    private Double odometerKm;

    private Double fuelLevelPercent;

    private Boolean ignitionOn;

    public static Position record(Device device, PositionReport report, Instant receivedAt) {
        Position position = new Position();
        position.id = UUID.randomUUID();
        position.vehicleId = device.getVehicleId();
        position.deviceId = device.getId();
        position.recordedAt = report.recordedAt();
        position.receivedAt = receivedAt;
        position.latitude = report.latitude();
        position.longitude = report.longitude();
        position.speedKph = report.speedKph();
        position.headingDegrees = report.headingDegrees();
        position.odometerKm = report.odometerKm();
        position.fuelLevelPercent = report.fuelLevelPercent();
        position.ignitionOn = report.ignitionOn();
        return position;
    }
}
