package com.pcd.shared.events;

import java.util.List;

public final class Topics {

    public static final String CUSTOMER_EVENTS = "smart-mobility.customer.events";
    public static final String DRIVER_EVENTS = "smart-mobility.driver.events";
    public static final String VEHICLE_EVENTS = "smart-mobility.vehicle.events";
    public static final String TRIP_EVENTS = "smart-mobility.trip.events";
    public static final String VEHICLE_POSITIONS = "smart-mobility.telemetry.positions";
    public static final String GEOFENCE_EVENTS = "smart-mobility.geofence.events";
    public static final String MAINTENANCE_EVENTS = "smart-mobility.maintenance.events";
    public static final String BILLING_EVENTS = "smart-mobility.billing.events";
    public static final String ACCOUNT_EVENTS = "smart-mobility.account.events";

    public static final List<String> ALL = List.of(CUSTOMER_EVENTS, DRIVER_EVENTS, VEHICLE_EVENTS, TRIP_EVENTS,
            VEHICLE_POSITIONS, GEOFENCE_EVENTS, MAINTENANCE_EVENTS, BILLING_EVENTS, ACCOUNT_EVENTS);

    private Topics() {
    }
}
