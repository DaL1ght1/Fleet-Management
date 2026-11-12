package com.pcd.billingservice.infrastructure.persistence;

import com.pcd.billingservice.domain.Invoice;
import com.pcd.billingservice.domain.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID>, JpaSpecificationExecutor<Invoice> {

    boolean existsByTripId(UUID tripId);

    Optional<Invoice> findByTripId(UUID tripId);

    long countByStatus(InvoiceStatus status);

    List<Invoice> findByStatusAndDueDateBeforeAndOverdueNotifiedAtIsNull(InvoiceStatus status, LocalDate date);

    @Query(value = "SELECT nextval('invoice_number_seq')", nativeQuery = true)
    long nextNumber();

    @Query("select coalesce(sum(i.total), 0) from Invoice i where i.status = com.pcd.billingservice.domain.InvoiceStatus.ISSUED")
    BigDecimal outstanding();

    @Query("""
            select coalesce(sum(i.total), 0) from Invoice i
            where i.status = com.pcd.billingservice.domain.InvoiceStatus.ISSUED and i.dueDate < :today
            """)
    BigDecimal overdueAmount(LocalDate today);

    long countByStatusAndDueDateBefore(InvoiceStatus status, LocalDate today);

    @Query("""
            select coalesce(sum(i.total), 0) from Invoice i
            where i.status = com.pcd.billingservice.domain.InvoiceStatus.PAID and i.paidOn >= :since
            """)
    BigDecimal collectedSince(LocalDate since);
}
