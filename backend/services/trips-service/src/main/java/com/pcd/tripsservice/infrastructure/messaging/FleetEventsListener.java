package com.pcd.tripsservice.infrastructure.messaging;

import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.tripsservice.application.FleetAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FleetEventsListener {

    private final FleetAvailabilityService fleetAvailability;

    @KafkaListener(topics = Topics.VEHICLE_EVENTS)
    public void onVehicleEvent(VehicleEvent event) {
        fleetAvailability.onVehicleEvent(event);
    }

    @KafkaListener(topics = Topics.CUSTOMER_EVENTS)
    public void onCustomerEvent(CustomerEvent event) {
        fleetAvailability.onCustomerEvent(event);
    }

    @KafkaListener(topics = Topics.DRIVER_EVENTS)
    public void onDriverEvent(DriverEvent event) {
        fleetAvailability.onDriverEvent(event);
    }
}
