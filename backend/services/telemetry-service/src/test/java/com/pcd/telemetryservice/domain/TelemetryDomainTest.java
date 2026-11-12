package com.pcd.telemetryservice.domain;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TelemetryDomainTest {

    private static final Instant NOW = Instant.parse("2030-01-01T10:00:00Z");

    private final DeviceKey key = DeviceKey.generate();
    private final Device device = Device.register(UUID.randomUUID(), "Tracker", key, NOW);

    @Test
    void deviceKeysAreRandomAndStoredOnlyAsHashes() {
        DeviceKey other = DeviceKey.generate();

        assertThat(key.value()).startsWith("ssd_").isNotEqualTo(other.value());
        assertThat(device.getKeyHash()).hasSize(64).isEqualTo(new DeviceKey(key.value()).hash());
        assertThat(key.toString()).doesNotContain(key.value().substring(4));
    }

    @Test
    void impossibleReadingsAreRejected() {
        assertThatThrownBy(() -> report(NOW, 95, 10, 50)).hasMessageContaining("latitude");
        assertThatThrownBy(() -> report(NOW, 36, 10, 500)).hasMessageContaining("speedKph");
        assertThatThrownBy(() -> report(NOW.plus(Duration.ofHours(1)), 36, 10, 50).ensureNotFromTheFuture(NOW))
                .hasMessageContaining("future");
    }

    @Test
    void theLatestPositionOnlyMovesForward() {
        Position first = Position.record(device, report(NOW, 36.80, 10.18, 40), NOW);
        Position older = Position.record(device, report(NOW.minusSeconds(60), 36.70, 10.10, 0), NOW);
        Position newer = Position.record(device, report(NOW.plusSeconds(30), 36.81, 10.19, 1), NOW);
        LatestPosition latest = LatestPosition.from(first);

        assertThat(latest.advanceTo(older)).isFalse();
        assertThat(latest.getLatitude()).isEqualTo(36.80);
        assertThat(latest.advanceTo(newer)).isTrue();
        assertThat(latest.isMoving()).isFalse();
        assertThat(latest.isStale(NOW.plus(Duration.ofMinutes(10)), Duration.ofMinutes(5))).isTrue();
    }

    @Test
    void revokedDevicesStayRevoked() {
        device.revoke(NOW);
        device.revoke(NOW.plusSeconds(5));

        assertThat(device.getRevokedAt()).isEqualTo(NOW);
    }

    private static PositionReport report(Instant at, double latitude, double longitude, double speed) {
        return new PositionReport(at, latitude, longitude, speed, 90.0, 1200.5, 60.0, true);
    }
}
