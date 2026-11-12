package com.pcd.maintenanceservice.application;

import com.pcd.maintenanceservice.domain.WorkOrderKind;
import com.pcd.maintenanceservice.domain.WorkOrderStatus;

import java.util.UUID;

public record WorkOrderCriteria(WorkOrderStatus status, WorkOrderKind kind, UUID vehicleId, Boolean overdue) {

    public static final WorkOrderCriteria ANY = new WorkOrderCriteria(null, null, null, null);
}
