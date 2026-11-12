package com.pcd.geofenceservice.domain;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "zone_occupancies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ZoneOccupancy {

    private static final Duration SPEED_ALERT_COOLDOWN = Duration.ofMinutes(10);

    @EmbeddedId
    private Key id;

    private boolean inside;

    private Instant lastPositionAt;

    private Instant lastSpeedAlertAt;

    @Embeddable
    public record Key(UUID geofenceId, UUID vehicleId) {
    }

    public static ZoneOccupancy outside(UUID geofenceId, UUID vehicleId) {
        ZoneOccupancy occupancy = new ZoneOccupancy();
        occupancy.id = new Key(geofenceId, vehicleId);
        occupancy.lastPositionAt = Instant.EPOCH;
        return occupancy;
    }

    public boolean accepts(Instant recordedAt) {
        return recordedAt.isAfter(lastPositionAt);
    }

    public Optional<AlertType> observe(boolean nowInside, Instant recordedAt) {
        if (!accepts(recordedAt)) {
            return Optional.empty();
        }
        lastPositionAt = recordedAt;
        if (nowInside == inside) {
            return Optional.empty();
        }
        inside = nowInside;
        if (!nowInside) {
            lastSpeedAlertAt = null;
        }
        return Optional.of(nowInside ? AlertType.VEHICLE_ENTERED : AlertType.VEHICLE_EXITED);
    }

    public boolean shouldAlertSpeeding(Instant recordedAt) {
        if (!inside || (lastSpeedAlertAt != null && recordedAt.isBefore(lastSpeedAlertAt.plus(SPEED_ALERT_COOLDOWN)))) {
            return false;
        }
        lastSpeedAlertAt = recordedAt;
        return true;
    }
}
