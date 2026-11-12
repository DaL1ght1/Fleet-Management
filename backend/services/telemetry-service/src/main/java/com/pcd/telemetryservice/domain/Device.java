package com.pcd.telemetryservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "devices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Device {

    private static final int MAX_LABEL_LENGTH = 100;

    @Id
    private UUID id;

    private UUID vehicleId;

    private String label;

    private String keyHash;

    private Instant createdAt;

    private Instant lastSeenAt;

    private Instant revokedAt;

    public static Device register(UUID vehicleId, String label, DeviceKey key, Instant now) {
        if (label == null || label.isBlank() || label.strip().length() > MAX_LABEL_LENGTH) {
            throw new IllegalArgumentException("label must be between 1 and %d characters".formatted(MAX_LABEL_LENGTH));
        }
        Device device = new Device();
        device.id = UUID.randomUUID();
        device.vehicleId = vehicleId;
        device.label = label.strip();
        device.keyHash = key.hash();
        device.createdAt = now;
        return device;
    }

    public void ensureActive() {
        if (isRevoked()) {
            throw new BusinessRuleViolationException("Device %s has been revoked".formatted(id));
        }
    }

    public void markSeen(Instant now) {
        lastSeenAt = now;
    }

    public void revoke(Instant now) {
        if (!isRevoked()) {
            revokedAt = now;
        }
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }
}
