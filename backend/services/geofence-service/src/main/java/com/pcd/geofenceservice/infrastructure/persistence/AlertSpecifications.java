package com.pcd.geofenceservice.infrastructure.persistence;

import com.pcd.geofenceservice.application.AlertCriteria;
import com.pcd.geofenceservice.domain.GeofenceAlert;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class AlertSpecifications {

    private AlertSpecifications() {
    }

    public static Specification<GeofenceAlert> matching(AlertCriteria criteria) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.acknowledged() != null) {
                predicates.add(criteria.acknowledged()
                        ? builder.isNotNull(root.get("acknowledgedAt"))
                        : builder.isNull(root.get("acknowledgedAt")));
            }
            if (criteria.severity() != null) {
                predicates.add(builder.equal(root.get("severity"), criteria.severity()));
            }
            if (criteria.geofenceId() != null) {
                predicates.add(builder.equal(root.get("geofenceId"), criteria.geofenceId()));
            }
            if (criteria.vehicleId() != null) {
                predicates.add(builder.equal(root.get("vehicleId"), criteria.vehicleId()));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
