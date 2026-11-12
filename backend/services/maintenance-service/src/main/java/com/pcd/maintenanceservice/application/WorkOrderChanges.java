package com.pcd.maintenanceservice.application;

import com.pcd.maintenanceservice.domain.WorkOrder;
import com.pcd.maintenanceservice.domain.WorkOrderKind;
import com.pcd.maintenanceservice.domain.WorkOrderPriority;

import java.time.LocalDate;

public record WorkOrderChanges(WorkOrderKind kind, WorkOrderPriority priority, String title, String description,
                               String vendor, LocalDate scheduledFor) {

    WorkOrder.Plan applyTo(WorkOrder.Plan current) {
        return new WorkOrder.Plan(current.vehicleId(),
                kind != null ? kind : current.kind(),
                priority != null ? priority : current.priority(),
                title != null ? title : current.title(),
                description != null ? description : current.description(),
                vendor != null ? vendor : current.vendor(),
                scheduledFor != null ? scheduledFor : current.scheduledFor());
    }
}
