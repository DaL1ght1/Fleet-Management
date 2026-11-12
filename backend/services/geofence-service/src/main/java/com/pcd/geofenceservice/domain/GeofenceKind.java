package com.pcd.geofenceservice.domain;

public enum GeofenceKind {
    DEPOT(AlertSeverity.INFO, AlertSeverity.INFO),
    SERVICE_AREA(AlertSeverity.INFO, AlertSeverity.CRITICAL),
    RESTRICTED(AlertSeverity.CRITICAL, AlertSeverity.INFO);

    private final AlertSeverity onEnter;
    private final AlertSeverity onExit;

    GeofenceKind(AlertSeverity onEnter, AlertSeverity onExit) {
        this.onEnter = onEnter;
        this.onExit = onExit;
    }

    public AlertSeverity severityOn(AlertType transition) {
        return transition == AlertType.VEHICLE_ENTERED ? onEnter : onExit;
    }
}
