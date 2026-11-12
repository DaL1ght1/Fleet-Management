package com.pcd.maintenanceservice.infrastructure;

import com.pcd.maintenanceservice.application.WorkOrderService;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaintenanceRuntime {

    private final WorkOrderService workOrders;

    @KafkaListener(topics = Topics.VEHICLE_EVENTS)
    public void onVehicleEvent(VehicleEvent event) {
        workOrders.onVehicleEvent(event);
    }

    @Scheduled(cron = "${smartstreet.maintenance.planning-cron:0 0 * * * *}")
    public void dailyPlanning() {
        workOrders.planDuePreventiveMaintenance();
        workOrders.flagOverdueWorkOrders();
    }
}
