package com.pcd.maintenanceservice.api;

import com.pcd.maintenanceservice.api.graphql.types.UpdateWorkOrderInput;
import com.pcd.maintenanceservice.api.graphql.types.Vehicle;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrderFilter;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrderInput;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrderPage;
import com.pcd.maintenanceservice.application.MaintenanceStatistics;
import com.pcd.maintenanceservice.application.WorkOrderChanges;
import com.pcd.maintenanceservice.application.WorkOrderCriteria;
import com.pcd.maintenanceservice.domain.WorkOrder;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Mapper
public interface MaintenanceGraphQlMapper {

    @Mapping(target = "vehicle", source = "vehicleId")
    @Mapping(target = "overdue", expression = "java(order.isOverdue(today))")
    @Mapping(target = "totalCost", expression = "java(order.totalCost())")
    com.pcd.maintenanceservice.api.graphql.types.WorkOrder toGraphQl(WorkOrder order, @Context LocalDate today);

    WorkOrderCriteria toCriteria(WorkOrderFilter filter);

    WorkOrderChanges toChanges(UpdateWorkOrderInput input);

    default WorkOrder.Plan toPlan(WorkOrderInput input) {
        return new WorkOrder.Plan(input.getVehicleId(),
                com.pcd.maintenanceservice.domain.WorkOrderKind.valueOf(input.getKind().name()),
                com.pcd.maintenanceservice.domain.WorkOrderPriority.valueOf(input.getPriority().name()),
                input.getTitle(), input.getDescription(), input.getVendor(), input.getScheduledFor());
    }

    default WorkOrderPage toPage(Page<WorkOrder> page, LocalDate today) {
        return WorkOrderPage.newBuilder()
                .items(page.getContent().stream().map(order -> toGraphQl(order, today)).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default com.pcd.maintenanceservice.api.graphql.types.MaintenanceStatistics toGraphQl(
            MaintenanceStatistics statistics) {
        return com.pcd.maintenanceservice.api.graphql.types.MaintenanceStatistics.newBuilder()
                .scheduled(Math.toIntExact(statistics.scheduled()))
                .inProgress(Math.toIntExact(statistics.inProgress()))
                .overdue(Math.toIntExact(statistics.overdue()))
                .completedThisMonth(Math.toIntExact(statistics.completedThisMonth()))
                .costThisMonth(statistics.costThisMonth())
                .build();
    }

    default Vehicle toVehicle(UUID id) {
        return Vehicle.newBuilder().id(id).build();
    }

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }
}
