package com.pcd.geofenceservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "geofences")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Geofence {

    @Id
    private UUID id;

    @Version
    private long version;

    private String name;

    @Enumerated(EnumType.STRING)
    private GeofenceKind kind;

    @JdbcTypeCode(SqlTypes.JSON)
    private GeofenceShape shape;

    private Double speedLimitKph;

    private boolean active;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Geofence define(GeofenceDefinition definition) {
        Geofence geofence = new Geofence();
        geofence.id = UUID.randomUUID();
        geofence.active = true;
        geofence.apply(definition);
        return geofence;
    }

    public void redefine(GeofenceDefinition definition) {
        apply(definition);
    }

    public void setActive(boolean nowActive) {
        active = nowActive;
    }

    public boolean contains(GeoPoint point) {
        return shape.contains(point);
    }

    public boolean isSpeeding(double speedKph) {
        return speedLimitKph != null && speedKph > speedLimitKph;
    }

    private void apply(GeofenceDefinition definition) {
        name = definition.name();
        kind = definition.kind();
        shape = definition.shape();
        speedLimitKph = definition.speedLimitKph();
    }
}
