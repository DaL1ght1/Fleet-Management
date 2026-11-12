package com.pcd.maintenanceservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.maintenanceservice.api.graphql.types.CompleteWorkOrderInput;
import com.pcd.maintenanceservice.api.graphql.types.MaintenanceStatistics;
import com.pcd.maintenanceservice.api.graphql.types.UpdateWorkOrderInput;
import com.pcd.maintenanceservice.api.graphql.types.Vehicle;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrder;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrderFilter;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrderInput;
import com.pcd.maintenanceservice.api.graphql.types.WorkOrderPage;
import com.pcd.maintenanceservice.application.WorkOrderCriteria;
import com.pcd.maintenanceservice.application.WorkOrderService;
import com.pcd.shared.security.ManagerOrAdmin;
import com.pcd.shared.security.Staff;
import lombok.RequiredArgsConstructor;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class MaintenanceResolver {

    private final WorkOrderService workOrders;
    private final MaintenanceGraphQlMapper mapper;
    private final Clock clock;

    @DgsQuery
    @Staff
    public WorkOrder workOrder(@InputArgument UUID id) {
        return workOrders.find(id).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @Staff
    public WorkOrderPage workOrders(@InputArgument WorkOrderFilter filter, @InputArgument Integer page,
                                    @InputArgument Integer size) {
        WorkOrderCriteria criteria = filter == null ? WorkOrderCriteria.ANY : mapper.toCriteria(filter);
        return mapper.toPage(workOrders.search(criteria, page, size), today());
    }

    @DgsQuery
    @Staff
    public MaintenanceStatistics maintenanceStatistics() {
        return mapper.toGraphQl(workOrders.statistics());
    }

    @DgsData(parentType = "Vehicle", field = "workOrders")
    @Staff
    public List<WorkOrder> vehicleWorkOrders(DgsDataFetchingEnvironment environment) {
        return workOrders.forVehicle(environment.<Vehicle>getSource().getId()).stream().map(this::toGraphQl).toList();
    }

    @DgsMutation
    @ManagerOrAdmin
    public WorkOrder scheduleWorkOrder(@InputArgument WorkOrderInput input) {
        return toGraphQl(workOrders.schedule(mapper.toPlan(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public WorkOrder updateWorkOrder(@InputArgument UUID id, @InputArgument UpdateWorkOrderInput input) {
        return toGraphQl(workOrders.replan(id, mapper.toChanges(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public WorkOrder startWorkOrder(@InputArgument UUID id) {
        return toGraphQl(workOrders.start(id));
    }

    @DgsMutation
    @ManagerOrAdmin
    public WorkOrder completeWorkOrder(@InputArgument UUID id, @InputArgument CompleteWorkOrderInput input) {
        return toGraphQl(workOrders.complete(id, input.getPartsCost(), input.getLaborCost(), input.getOdometerKm(),
                input.getResolutionNotes()));
    }

    @DgsMutation
    @ManagerOrAdmin
    public WorkOrder cancelWorkOrder(@InputArgument UUID id, @InputArgument String reason) {
        return toGraphQl(workOrders.cancel(id, reason));
    }

    @DgsEntityFetcher(name = "Vehicle")
    public Vehicle vehicleReference(Map<String, Object> representation) {
        return mapper.toVehicle(UUID.fromString(String.valueOf(representation.get("id"))));
    }

    @DgsEntityFetcher(name = "WorkOrder")
    public WorkOrder workOrderReference(Map<String, Object> representation) {
        return workOrders.find(UUID.fromString(String.valueOf(representation.get("id")))).map(this::toGraphQl)
                .orElse(null);
    }

    private WorkOrder toGraphQl(com.pcd.maintenanceservice.domain.WorkOrder order) {
        return mapper.toGraphQl(order, today());
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
