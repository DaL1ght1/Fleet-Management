package com.pcd.geofenceservice.infrastructure.messaging;

import com.pcd.geofenceservice.application.GeofenceMonitor;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehiclePositionEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PositionsListener {

    private final GeofenceMonitor monitor;

    @KafkaListener(topics = Topics.VEHICLE_POSITIONS)
    public void onPosition(VehiclePositionEvent position) {
        monitor.onPosition(position);
    }
}
