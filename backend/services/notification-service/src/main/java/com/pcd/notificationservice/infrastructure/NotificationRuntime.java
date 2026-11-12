package com.pcd.notificationservice.infrastructure;

import com.pcd.notificationservice.application.NotificationRouter;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.GeofenceEvent;
import com.pcd.shared.events.InvoiceEvent;
import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.events.VehicleEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationRuntime {

    private final NotificationRouter router;

    @KafkaListener(topics = Topics.GEOFENCE_EVENTS)
    public void onGeofenceEvent(GeofenceEvent event) {
        router.onGeofenceEvent(event);
    }

    @KafkaListener(topics = Topics.MAINTENANCE_EVENTS)
    public void onMaintenanceEvent(MaintenanceEvent event) {
        router.onMaintenanceEvent(event);
    }

    @KafkaListener(topics = Topics.TRIP_EVENTS)
    public void onTripEvent(TripEvent event) {
        router.onTripEvent(event);
    }

    @KafkaListener(topics = Topics.BILLING_EVENTS)
    public void onInvoiceEvent(InvoiceEvent event) {
        router.onInvoiceEvent(event);
    }

    @KafkaListener(topics = Topics.VEHICLE_EVENTS)
    public void onVehicleEvent(VehicleEvent event) {
        router.onVehicleEvent(event);
    }

    @KafkaListener(topics = Topics.DRIVER_EVENTS)
    public void onDriverEvent(DriverEvent event) {
        router.onDriverEvent(event);
    }

    @KafkaListener(topics = Topics.CUSTOMER_EVENTS)
    public void onCustomerEvent(CustomerEvent event) {
        router.onCustomerEvent(event);
    }

    @Scheduled(cron = "${smartstreet.notifications.daily-cron:0 0 7 * * *}")
    public void daily() {
        router.remindExpiringLicenses();
        router.purgeExpired();
    }
}
