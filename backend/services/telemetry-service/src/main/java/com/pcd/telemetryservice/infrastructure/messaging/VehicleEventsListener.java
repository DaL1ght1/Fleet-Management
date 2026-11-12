package com.pcd.telemetryservice.infrastructure.messaging;

import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.telemetryservice.application.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VehicleEventsListener {

    private final DeviceService deviceService;

    @KafkaListener(topics = Topics.VEHICLE_EVENTS)
    public void onVehicleEvent(VehicleEvent event) {
        deviceService.onVehicleEvent(event);
    }
}
