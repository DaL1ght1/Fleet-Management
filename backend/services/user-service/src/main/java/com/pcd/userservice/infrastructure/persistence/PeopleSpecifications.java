package com.pcd.userservice.infrastructure.persistence;

import com.pcd.userservice.application.DriverCriteria;
import com.pcd.userservice.domain.Customer;
import com.pcd.userservice.domain.Driver;
import com.pcd.userservice.domain.DriverStatus;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class PeopleSpecifications {

    private PeopleSpecifications() {
    }

    public static Specification<Customer> customersMatching(String search) {
        return (root, query, builder) -> search == null || search.isBlank()
                ? builder.conjunction()
                : textSearch(root, builder, search);
    }

    public static Specification<Driver> driversMatching(DriverCriteria criteria, LocalDate today) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.status() != null) {
                predicates.add(builder.equal(root.get("status"), criteria.status()));
            }
            if (criteria.search() != null && !criteria.search().isBlank()) {
                predicates.add(builder.or(textSearch(root, builder, criteria.search()),
                        builder.like(builder.lower(root.get("licenseNumber")), pattern(criteria.search()))));
            }
            if (criteria.available() != null) {
                Predicate available = builder.and(
                        builder.equal(root.get("status"), DriverStatus.ACTIVE),
                        builder.isNull(root.get("currentTripId")),
                        builder.greaterThanOrEqualTo(root.get("licenseExpiryDate"), today));
                predicates.add(criteria.available() ? available : builder.not(available));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate textSearch(Root<?> root, CriteriaBuilder builder, String search) {
        String pattern = pattern(search);
        return builder.or(
                builder.like(builder.lower(root.get("firstName")), pattern),
                builder.like(builder.lower(root.get("lastName")), pattern),
                builder.like(builder.lower(root.get("email")), pattern));
    }

    private static String pattern(String search) {
        return "%" + search.strip().toLowerCase(Locale.ROOT) + "%";
    }
}
