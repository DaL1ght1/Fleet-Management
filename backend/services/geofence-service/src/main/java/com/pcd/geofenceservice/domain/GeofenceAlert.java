package com.pcd.geofenceservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "geofence_alerts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GeofenceAlert {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private AlertType type;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    private UUID geofenceId;

    private String geofenceName;

    private UUID vehicleId;

    private double latitude;

    private double longitude;

    private double speedKph;

    private Double speedLimitKph;

    private Instant occurredAt;

    private Instant acknowledgedAt;

    private UUID acknowledgedBy;

    public static GeofenceAlert raise(AlertType type, Geofence geofence, UUID vehicleId, GeoPoint point,
                                      double speedKph, Instant occurredAt) {
        GeofenceAlert alert = new GeofenceAlert();
        alert.id = UUID.randomUUID();
        alert.type = type;
        alert.severity = type == AlertType.SPEED_LIMIT_EXCEEDED
                ? AlertSeverity.WARNING
                : geofence.getKind().severityOn(type);
        alert.geofenceId = geofence.getId();
        alert.geofenceName = geofence.getName();
        alert.vehicleId = vehicleId;
        alert.latitude = point.latitude();
        alert.longitude = point.longitude();
        alert.speedKph = speedKph;
        alert.speedLimitKph = geofence.getSpeedLimitKph();
        alert.occurredAt = occurredAt;
        return alert;
    }

    public void acknowledge(UUID accountId, Instant now) {
        if (acknowledgedAt == null) {
            acknowledgedAt = now;
            acknowledgedBy = accountId;
        }
    }

    public boolean isAcknowledged() {
        return acknowledgedAt != null;
    }
}
