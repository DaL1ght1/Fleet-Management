package com.pcd.vehiclesservice.infrastructure.messaging;

import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.events.VehiclePositionEvent;
import com.pcd.vehiclesservice.application.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FleetEventsListener {

    private final VehicleService vehicleService;

    @KafkaListener(topics = Topics.TRIP_EVENTS)
    public void onTripEvent(TripEvent event) {
        vehicleService.onTripEvent(event);
    }

    @KafkaListener(topics = Topics.MAINTENANCE_EVENTS)
    public void onMaintenanceEvent(MaintenanceEvent event) {
        vehicleService.onMaintenanceEvent(event);
    }

    @KafkaListener(topics = Topics.VEHICLE_POSITIONS)
    public void onVehiclePosition(VehiclePositionEvent event) {
        vehicleService.onVehiclePosition(event);
    }
}
