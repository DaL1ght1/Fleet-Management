package com.pcd.geofenceservice.application;

import com.pcd.geofenceservice.domain.Geofence;
import com.pcd.geofenceservice.domain.GeofenceAlert;
import com.pcd.geofenceservice.domain.GeofenceDefinition;
import com.pcd.geofenceservice.infrastructure.persistence.AlertSpecifications;
import com.pcd.geofenceservice.infrastructure.persistence.GeofenceAlertRepository;
import com.pcd.geofenceservice.infrastructure.persistence.GeofenceRepository;
import com.pcd.geofenceservice.infrastructure.persistence.ZoneOccupancyRepository;
import com.pcd.shared.error.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GeofenceService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "occurredAt");

    private final GeofenceRepository geofences;
    private final ZoneOccupancyRepository occupancies;
    private final GeofenceAlertRepository alerts;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<Geofence> all() {
        return geofences.findAllByOrderByName();
    }

    @Transactional(readOnly = true)
    public Optional<Geofence> find(UUID id) {
        return geofences.findById(id);
    }

    @Transactional(readOnly = true)
    public long vehiclesInside(UUID geofenceId) {
        return occupancies.countByIdGeofenceIdAndInsideTrue(geofenceId);
    }

    @Transactional(readOnly = true)
    public List<Geofence> containing(UUID vehicleId) {
        return geofences.findAllById(occupancies.findGeofencesContaining(vehicleId)).stream()
                .filter(Geofence::isActive)
                .toList();
    }

    public Geofence define(GeofenceDefinition definition) {
        return geofences.save(Geofence.define(definition));
    }

    public Geofence redefine(UUID id, GeofenceDefinition definition) {
        Geofence geofence = load(id);
        geofence.redefine(definition);
        occupancies.deleteByGeofenceId(id);
        return geofence;
    }

    public Geofence setActive(UUID id, boolean active) {
        Geofence geofence = load(id);
        geofence.setActive(active);
        if (!active) {
            occupancies.deleteByGeofenceId(id);
        }
        return geofence;
    }

    public void delete(UUID id) {
        Geofence geofence = load(id);
        occupancies.deleteByGeofenceId(id);
        geofences.delete(geofence);
    }

    @Transactional(readOnly = true)
    public Page<GeofenceAlert> alerts(AlertCriteria criteria, int page, int size) {
        return alerts.findAll(AlertSpecifications.matching(criteria),
                PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), NEWEST_FIRST));
    }

    @Transactional(readOnly = true)
    public long unacknowledgedCount() {
        return alerts.countByAcknowledgedAtIsNull();
    }

    public GeofenceAlert acknowledge(UUID alertId, UUID accountId) {
        GeofenceAlert alert = alerts.findById(alertId).orElseThrow(() -> new NotFoundException("Alert", alertId));
        alert.acknowledge(accountId, clock.instant());
        return alert;
    }

    public int acknowledgeAll(UUID accountId) {
        return alerts.acknowledgeAll(accountId, clock.instant());
    }

    private Geofence load(UUID id) {
        return geofences.findById(id).orElseThrow(() -> new NotFoundException("Geofence", id));
    }
}
