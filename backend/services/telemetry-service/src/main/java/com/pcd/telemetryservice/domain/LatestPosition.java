package com.pcd.telemetryservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "latest_positions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LatestPosition {

    private static final double STANDSTILL_KPH = 3;

    @Id
    private UUID vehicleId;

    private Instant recordedAt;

    private double latitude;

    private double longitude;

    private double speedKph;

    private Double headingDegrees;

    private Double odometerKm;

    private Double fuelLevelPercent;

    private Boolean ignitionOn;

    public static LatestPosition from(Position position) {
        LatestPosition latest = new LatestPosition();
        latest.vehicleId = position.getVehicleId();
        latest.recordedAt = Instant.EPOCH;
        latest.advanceTo(position);
        return latest;
    }

    public boolean advanceTo(Position position) {
        if (!position.getRecordedAt().isAfter(recordedAt)) {
            return false;
        }
        recordedAt = position.getRecordedAt();
        latitude = position.getLatitude();
        longitude = position.getLongitude();
        speedKph = position.getSpeedKph();
        headingDegrees = position.getHeadingDegrees();
        odometerKm = position.getOdometerKm();
        fuelLevelPercent = position.getFuelLevelPercent();
        ignitionOn = position.getIgnitionOn();
        return true;
    }

    public boolean isMoving() {
        return speedKph > STANDSTILL_KPH;
    }

    public boolean isStale(Instant now, Duration threshold) {
        return recordedAt.plus(threshold).isBefore(now);
    }
}
