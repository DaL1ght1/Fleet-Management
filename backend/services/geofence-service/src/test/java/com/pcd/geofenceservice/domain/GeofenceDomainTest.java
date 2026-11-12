package com.pcd.geofenceservice.domain;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeofenceDomainTest {

    private static final Instant NOW = Instant.parse("2030-01-01T10:00:00Z");
    private static final GeofenceShape.Polygon TUNIS_CENTRE = new GeofenceShape.Polygon(List.of(
            new GeoPoint(36.79, 10.16), new GeoPoint(36.79, 10.20), new GeoPoint(36.82, 10.20),
            new GeoPoint(36.82, 10.16)));

    @Test
    void polygonsContainInteriorPointsOnly() {
        assertThat(TUNIS_CENTRE.contains(new GeoPoint(36.80, 10.18))).isTrue();
        assertThat(TUNIS_CENTRE.contains(new GeoPoint(36.85, 10.18))).isFalse();
    }

    @Test
    void circlesUseGreatCircleDistance() {
        GeofenceShape.Circle depot = new GeofenceShape.Circle(new GeoPoint(36.8065, 10.1815), 500);

        assertThat(depot.contains(new GeoPoint(36.8080, 10.1830))).isTrue();
        assertThat(depot.contains(new GeoPoint(36.8200, 10.1815))).isFalse();
    }

    @Test
    void degeneratePolygonsAreRejected() {
        assertThatThrownBy(() -> new GeofenceShape.Polygon(List.of(new GeoPoint(1, 1), new GeoPoint(2, 2))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void transitionsAreReportedOnceAndOutOfOrderPositionsAreIgnored() {
        ZoneOccupancy occupancy = ZoneOccupancy.outside(UUID.randomUUID(), UUID.randomUUID());

        assertThat(occupancy.observe(true, NOW)).contains(AlertType.VEHICLE_ENTERED);
        assertThat(occupancy.observe(true, NOW.plusSeconds(10))).isEmpty();
        assertThat(occupancy.accepts(NOW.minusSeconds(5))).isFalse();
        assertThat(occupancy.observe(false, NOW.plusSeconds(20))).contains(AlertType.VEHICLE_EXITED);
    }

    @Test
    void speedingAlertsRespectACooldown() {
        ZoneOccupancy occupancy = ZoneOccupancy.outside(UUID.randomUUID(), UUID.randomUUID());
        occupancy.observe(true, NOW);

        assertThat(occupancy.shouldAlertSpeeding(NOW)).isTrue();
        assertThat(occupancy.shouldAlertSpeeding(NOW.plus(Duration.ofMinutes(5)))).isFalse();
        assertThat(occupancy.shouldAlertSpeeding(NOW.plus(Duration.ofMinutes(11)))).isTrue();
    }

    @Test
    void severityDependsOnTheKindOfZone() {
        Geofence restricted = Geofence.define(new GeofenceDefinition("Airport apron", GeofenceKind.RESTRICTED,
                TUNIS_CENTRE, null));
        Geofence serviceArea = Geofence.define(new GeofenceDefinition("Greater Tunis", GeofenceKind.SERVICE_AREA,
                TUNIS_CENTRE, 50.0));
        GeoPoint point = new GeoPoint(36.80, 10.18);

        assertThat(GeofenceAlert.raise(AlertType.VEHICLE_ENTERED, restricted, UUID.randomUUID(), point, 10, NOW)
                .getSeverity()).isEqualTo(AlertSeverity.CRITICAL);
        assertThat(GeofenceAlert.raise(AlertType.VEHICLE_EXITED, serviceArea, UUID.randomUUID(), point, 10, NOW)
                .getSeverity()).isEqualTo(AlertSeverity.CRITICAL);
        assertThat(GeofenceAlert.raise(AlertType.SPEED_LIMIT_EXCEEDED, serviceArea, UUID.randomUUID(), point, 80, NOW)
                .getSeverity()).isEqualTo(AlertSeverity.WARNING);
        assertThat(serviceArea.isSpeeding(51)).isTrue();
    }
}
