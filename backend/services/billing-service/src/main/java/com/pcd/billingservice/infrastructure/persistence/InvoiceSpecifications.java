package com.pcd.billingservice.infrastructure.persistence;

import com.pcd.billingservice.application.InvoiceCriteria;
import com.pcd.billingservice.domain.Invoice;
import com.pcd.billingservice.domain.InvoiceStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public final class InvoiceSpecifications {

    private InvoiceSpecifications() {
    }

    public static Specification<Invoice> matching(InvoiceCriteria criteria, LocalDate today) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.status() != null) {
                predicates.add(builder.equal(root.get("status"), criteria.status()));
            }
            if (criteria.customerId() != null) {
                predicates.add(builder.equal(root.get("customerId"), criteria.customerId()));
            }
            if (criteria.overdue() != null) {
                Predicate overdue = builder.and(builder.equal(root.get("status"), InvoiceStatus.ISSUED),
                        builder.lessThan(root.get("dueDate"), today));
                predicates.add(criteria.overdue() ? overdue : builder.not(overdue));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Invoice> visibleTo(Collection<UUID> customerIds) {
        return (root, query, builder) -> customerIds.isEmpty()
                ? builder.disjunction()
                : builder.and(root.get("customerId").in(customerIds),
                builder.notEqual(root.get("status"), InvoiceStatus.DRAFT));
    }
}
