package com.pcd.geofenceservice.application;

import com.pcd.geofenceservice.domain.AlertType;
import com.pcd.geofenceservice.domain.GeoPoint;
import com.pcd.geofenceservice.domain.Geofence;
import com.pcd.geofenceservice.domain.GeofenceAlert;
import com.pcd.geofenceservice.domain.ZoneOccupancy;
import com.pcd.geofenceservice.infrastructure.persistence.GeofenceAlertRepository;
import com.pcd.geofenceservice.infrastructure.persistence.GeofenceRepository;
import com.pcd.geofenceservice.infrastructure.persistence.ZoneOccupancyRepository;
import com.pcd.shared.events.GeofenceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehiclePositionEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeofenceMonitor {

    private final GeofenceRepository geofences;
    private final ZoneOccupancyRepository occupancies;
    private final GeofenceAlertRepository alerts;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Transactional
    public List<GeofenceAlert> onPosition(VehiclePositionEvent position) {
        GeoPoint point = new GeoPoint(position.latitude(), position.longitude());
        Map<UUID, ZoneOccupancy> known = occupancies.findByIdVehicleId(position.vehicleId()).stream()
                .collect(Collectors.toMap(occupancy -> occupancy.getId().geofenceId(), Function.identity()));
        List<GeofenceAlert> raised = new ArrayList<>();
        for (Geofence geofence : geofences.findByActiveTrue()) {
            ZoneOccupancy occupancy = known.computeIfAbsent(geofence.getId(),
                    geofenceId -> occupancies.save(ZoneOccupancy.outside(geofenceId, position.vehicleId())));
            if (!occupancy.accepts(position.recordedAt())) {
                continue;
            }
            occupancy.observe(geofence.contains(point), position.recordedAt())
                    .map(transition -> raise(transition, geofence, position, point))
                    .ifPresent(raised::add);
            if (geofence.isSpeeding(position.speedKph()) && occupancy.shouldAlertSpeeding(position.recordedAt())) {
                raised.add(raise(AlertType.SPEED_LIMIT_EXCEEDED, geofence, position, point));
            }
        }
        return raised;
    }

    private GeofenceAlert raise(AlertType type, Geofence geofence, VehiclePositionEvent position, GeoPoint point) {
        GeofenceAlert alert = alerts.save(GeofenceAlert.raise(type, geofence, position.vehicleId(), point,
                position.speedKph(), position.recordedAt()));
        events.publish(Topics.GEOFENCE_EVENTS, alert.getVehicleId().toString(), new GeofenceEvent(
                UUID.randomUUID(), GeofenceEvent.Type.valueOf(type.name()), clock.instant(), alert.getId(),
                geofence.getId(), geofence.getName(), alert.getVehicleId(),
                GeofenceEvent.Severity.valueOf(alert.getSeverity().name()), alert.getLatitude(),
                alert.getLongitude(), alert.getSpeedKph(), alert.getSpeedLimitKph()));
        return alert;
    }
}
