package com.pcd.tripsservice.infrastructure.persistence;

import com.pcd.tripsservice.application.TripCriteria;
import com.pcd.tripsservice.domain.Trip;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public final class TripSpecifications {

    private TripSpecifications() {
    }

    public static Specification<Trip> involving(Collection<UUID> driverIds, Collection<UUID> customerIds) {
        return (root, query, builder) -> builder.or(
                driverIds.isEmpty() ? builder.disjunction() : root.get("driverId").in(driverIds),
                customerIds.isEmpty() ? builder.disjunction() : root.get("customerId").in(customerIds));
    }

    public static Specification<Trip> matching(TripCriteria criteria) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.status() != null) {
                predicates.add(builder.equal(root.get("status"), criteria.status()));
            }
            if (criteria.type() != null) {
                predicates.add(builder.equal(root.get("type"), criteria.type()));
            }
            if (criteria.vehicleId() != null) {
                predicates.add(builder.equal(root.get("vehicleId"), criteria.vehicleId()));
            }
            if (criteria.driverId() != null) {
                predicates.add(builder.equal(root.get("driverId"), criteria.driverId()));
            }
            if (criteria.customerId() != null) {
                predicates.add(builder.equal(root.get("customerId"), criteria.customerId()));
            }
            if (criteria.scheduledFrom() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("scheduledStart"), criteria.scheduledFrom()));
            }
            if (criteria.scheduledTo() != null) {
                predicates.add(builder.lessThan(root.get("scheduledStart"), criteria.scheduledTo()));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
