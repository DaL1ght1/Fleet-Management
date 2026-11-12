package com.pcd.vehiclesservice.infrastructure.persistence;

import com.pcd.vehiclesservice.application.VehicleCriteria;
import com.pcd.vehiclesservice.domain.Vehicle;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class VehicleSpecifications {

    private VehicleSpecifications() {
    }

    public static Specification<Vehicle> matching(VehicleCriteria criteria, LocalDate today) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.status() != null) {
                predicates.add(builder.equal(root.get("status"), criteria.status()));
            }
            if (criteria.fuelType() != null) {
                predicates.add(builder.equal(root.get("fuelType"), criteria.fuelType()));
            }
            if (criteria.search() != null && !criteria.search().isBlank()) {
                String pattern = "%" + criteria.search().strip().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("licensePlate")), pattern),
                        builder.like(builder.lower(root.get("vin")), pattern),
                        builder.like(builder.lower(root.get("make")), pattern),
                        builder.like(builder.lower(root.get("model")), pattern)));
            }
            if (criteria.maintenanceDue() != null) {
                Predicate due = builder.lessThanOrEqualTo(root.get("nextMaintenanceDate"), today);
                predicates.add(criteria.maintenanceDue() ? due : builder.not(due));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
