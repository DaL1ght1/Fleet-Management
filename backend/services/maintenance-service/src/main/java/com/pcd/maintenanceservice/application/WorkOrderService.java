package com.pcd.maintenanceservice.application;

import com.pcd.maintenanceservice.domain.MaintainedVehicle;
import com.pcd.maintenanceservice.domain.WorkOrder;
import com.pcd.maintenanceservice.domain.WorkOrderKind;
import com.pcd.maintenanceservice.domain.WorkOrderPriority;
import com.pcd.maintenanceservice.domain.WorkOrderStatus;
import com.pcd.maintenanceservice.infrastructure.persistence.MaintainedVehicleRepository;
import com.pcd.maintenanceservice.infrastructure.persistence.WorkOrderRepository;
import com.pcd.maintenanceservice.infrastructure.persistence.WorkOrderSpecifications;
import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkOrderService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int PREVENTIVE_HORIZON_DAYS = 7;
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "scheduledFor");

    private final WorkOrderRepository workOrders;
    private final MaintainedVehicleRepository vehicles;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Optional<WorkOrder> find(UUID id) {
        return workOrders.findById(id);
    }

    @Transactional(readOnly = true)
    public List<WorkOrder> forVehicle(UUID vehicleId) {
        return workOrders.findByVehicleIdOrderByScheduledForDesc(vehicleId);
    }

    @Transactional(readOnly = true)
    public Page<WorkOrder> search(WorkOrderCriteria criteria, int page, int size) {
        return workOrders.findAll(WorkOrderSpecifications.matching(criteria, today()),
                PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), DEFAULT_SORT));
    }

    @Transactional(readOnly = true)
    public MaintenanceStatistics statistics() {
        var monthStart = today().withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        return new MaintenanceStatistics(
                workOrders.countByStatus(WorkOrderStatus.SCHEDULED),
                workOrders.countByStatus(WorkOrderStatus.IN_PROGRESS),
                workOrders.countByStatusAndScheduledForBefore(WorkOrderStatus.SCHEDULED, today()),
                workOrders.countByStatusAndCompletedAtGreaterThanEqual(WorkOrderStatus.COMPLETED, monthStart),
                workOrders.costSince(monthStart));
    }

    public WorkOrder schedule(WorkOrder.Plan plan) {
        if (!vehicles.existsByIdAndDeletedFalse(plan.vehicleId())) {
            throw new BusinessRuleViolationException("Vehicle %s is unknown".formatted(plan.vehicleId()));
        }
        WorkOrder order = workOrders.save(WorkOrder.schedule(plan, false));
        publish(MaintenanceEvent.Type.WORK_ORDER_SCHEDULED, order);
        return order;
    }

    public WorkOrder replan(UUID id, WorkOrderChanges changes) {
        WorkOrder order = load(id);
        order.replan(changes.applyTo(order.plan()));
        publish(MaintenanceEvent.Type.WORK_ORDER_SCHEDULED, order);
        return order;
    }

    public WorkOrder start(UUID id) {
        WorkOrder order = load(id);
        order.start(clock.instant());
        publish(MaintenanceEvent.Type.WORK_ORDER_STARTED, order);
        return order;
    }

    public WorkOrder complete(UUID id, BigDecimal partsCost, BigDecimal laborCost, Long odometerKm, String notes) {
        WorkOrder order = load(id);
        order.complete(clock.instant(), partsCost, laborCost, odometerKm, notes);
        publish(MaintenanceEvent.Type.WORK_ORDER_COMPLETED, order);
        return order;
    }

    public WorkOrder cancel(UUID id, String reason) {
        WorkOrder order = load(id);
        order.cancel(reason);
        publish(MaintenanceEvent.Type.WORK_ORDER_CANCELLED, order);
        return order;
    }

    public void onVehicleEvent(VehicleEvent event) {
        boolean deleted = event.type() == VehicleEvent.Type.VEHICLE_DELETED;
        MaintainedVehicle vehicle = vehicles.findById(event.vehicleId())
                .orElseGet(() -> vehicles.save(MaintainedVehicle.track(event.vehicleId())));
        if (vehicle.apply(event.occurredAt(), event.licensePlate(), event.nextMaintenanceDate(), deleted) && !deleted) {
            planPreventiveMaintenance(vehicle);
        }
    }

    public int planDuePreventiveMaintenance() {
        List<MaintainedVehicle> due = vehicles.findByDeletedFalseAndNextMaintenanceDateLessThanEqual(
                today().plusDays(PREVENTIVE_HORIZON_DAYS));
        return (int) due.stream().filter(this::planPreventiveMaintenance).count();
    }

    public int flagOverdueWorkOrders() {
        List<WorkOrder> overdue = workOrders.findByStatusAndScheduledForBeforeAndOverdueNotifiedAtIsNull(
                WorkOrderStatus.SCHEDULED, today());
        overdue.stream().filter(order -> order.markOverdueNotified(clock.instant()))
                .forEach(order -> publish(MaintenanceEvent.Type.WORK_ORDER_OVERDUE, order));
        return overdue.size();
    }

    private boolean planPreventiveMaintenance(MaintainedVehicle vehicle) {
        LocalDate due = vehicle.getNextMaintenanceDate();
        if (due == null || due.isAfter(today().plusDays(PREVENTIVE_HORIZON_DAYS))
                || workOrders.existsByVehicleIdAndKindAndStatusIn(vehicle.getId(), WorkOrderKind.PREVENTIVE,
                WorkOrder.OPEN)) {
            return false;
        }
        WorkOrder order = workOrders.save(WorkOrder.schedule(new WorkOrder.Plan(vehicle.getId(),
                WorkOrderKind.PREVENTIVE, WorkOrderPriority.MEDIUM, "Scheduled service",
                "Periodic maintenance planned from the vehicle's service interval", null, due), true));
        publish(MaintenanceEvent.Type.WORK_ORDER_SCHEDULED, order);
        return true;
    }

    private WorkOrder load(UUID id) {
        return workOrders.findById(id).orElseThrow(() -> new NotFoundException("Work order", id));
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private void publish(MaintenanceEvent.Type type, WorkOrder order) {
        events.publish(Topics.MAINTENANCE_EVENTS, order.getVehicleId().toString(), new MaintenanceEvent(
                UUID.randomUUID(), type, clock.instant(), order.getId(), order.getVehicleId(),
                MaintenanceEvent.Kind.valueOf(order.getKind().name()), order.getTitle(), order.getScheduledFor(),
                order.getCompletedAt() == null ? null : LocalDate.ofInstant(order.getCompletedAt(), clock.getZone()),
                order.totalCost()));
    }
}
