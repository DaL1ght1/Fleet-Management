package com.pcd.geofenceservice.application;

import com.pcd.geofenceservice.domain.AlertSeverity;

import java.util.UUID;

public record AlertCriteria(Boolean acknowledged, AlertSeverity severity, UUID geofenceId, UUID vehicleId) {

    public static final AlertCriteria ANY = new AlertCriteria(null, null, null, null);
}
