package com.pcd.maintenanceservice.infrastructure.persistence;

import com.pcd.maintenanceservice.domain.WorkOrder;
import com.pcd.maintenanceservice.domain.WorkOrderKind;
import com.pcd.maintenanceservice.domain.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, UUID>, JpaSpecificationExecutor<WorkOrder> {

    List<WorkOrder> findByVehicleIdOrderByScheduledForDesc(UUID vehicleId);

    boolean existsByVehicleIdAndKindAndStatusIn(UUID vehicleId, WorkOrderKind kind, Collection<WorkOrderStatus> statuses);

    List<WorkOrder> findByStatusAndScheduledForBeforeAndOverdueNotifiedAtIsNull(WorkOrderStatus status, LocalDate date);

    long countByStatus(WorkOrderStatus status);

    long countByStatusAndScheduledForBefore(WorkOrderStatus status, LocalDate date);

    long countByStatusAndCompletedAtGreaterThanEqual(WorkOrderStatus status, Instant since);

    @Query("""
            select coalesce(sum(coalesce(o.partsCost, 0) + coalesce(o.laborCost, 0)), 0) from WorkOrder o
            where o.status = com.pcd.maintenanceservice.domain.WorkOrderStatus.COMPLETED and o.completedAt >= :since
            """)
    BigDecimal costSince(Instant since);
}
