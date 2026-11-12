package com.pcd.maintenanceservice.infrastructure.persistence;

import com.pcd.maintenanceservice.application.WorkOrderCriteria;
import com.pcd.maintenanceservice.domain.WorkOrder;
import com.pcd.maintenanceservice.domain.WorkOrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class WorkOrderSpecifications {

    private WorkOrderSpecifications() {
    }

    public static Specification<WorkOrder> matching(WorkOrderCriteria criteria, LocalDate today) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.status() != null) {
                predicates.add(builder.equal(root.get("status"), criteria.status()));
            }
            if (criteria.kind() != null) {
                predicates.add(builder.equal(root.get("kind"), criteria.kind()));
            }
            if (criteria.vehicleId() != null) {
                predicates.add(builder.equal(root.get("vehicleId"), criteria.vehicleId()));
            }
            if (criteria.overdue() != null) {
                Predicate overdue = builder.and(builder.equal(root.get("status"), WorkOrderStatus.SCHEDULED),
                        builder.lessThan(root.get("scheduledFor"), today));
                predicates.add(criteria.overdue() ? overdue : builder.not(overdue));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
