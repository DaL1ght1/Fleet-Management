package com.pcd.billingservice.infrastructure.persistence;

import com.pcd.billingservice.domain.Expense;
import com.pcd.billingservice.domain.ExpenseKind;
import com.pcd.billingservice.domain.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    boolean existsByKindAndSourceIdAndDueDate(ExpenseKind kind, UUID sourceId, LocalDate dueDate);

    boolean existsByKindAndSourceId(ExpenseKind kind, UUID sourceId);

    @Query("""
            select e from Expense e
            where (:kind is null or e.kind = :kind) and (:status is null or e.status = :status)
            order by case when e.status = com.pcd.billingservice.domain.ExpenseStatus.UNPAID then 0 else 1 end,
                     e.dueDate desc
            """)
    Page<Expense> search(ExpenseKind kind, ExpenseStatus status, Pageable pageable);

    @Query("""
            select coalesce(sum(e.amount), 0) from Expense e
            where e.kind = :kind and (:status is null or e.status = :status)
            """)
    BigDecimal total(ExpenseKind kind, ExpenseStatus status);

    @Query("""
            select coalesce(sum(e.amount), 0) from Expense e
            where e.status = com.pcd.billingservice.domain.ExpenseStatus.PAID and e.paidOn >= :since
            """)
    BigDecimal paidSince(LocalDate since);

    long countByStatus(ExpenseStatus status);
}
