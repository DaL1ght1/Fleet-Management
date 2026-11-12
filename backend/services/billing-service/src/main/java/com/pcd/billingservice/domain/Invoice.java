package com.pcd.billingservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Invoice {

    public static final String CURRENCY = "TND";
    private static final int MONEY_SCALE = 3;
    private static final int MAX_PAYMENT_TERM_DAYS = 120;

    @Id
    private UUID id;

    @Version
    private long version;

    private String number;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    private UUID tripId;

    private UUID customerId;

    private UUID vehicleId;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<InvoiceLine> lines;

    private BigDecimal subtotal;

    private BigDecimal taxRate;

    private BigDecimal taxAmount;

    private BigDecimal total;

    private LocalDate issuedOn;

    private LocalDate dueDate;

    private LocalDate paidOn;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String voidReason;

    private Instant overdueNotifiedAt;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Invoice draft(String number, UUID tripId, UUID customerId, UUID vehicleId, List<InvoiceLine> lines,
                                BigDecimal taxRate) {
        Objects.requireNonNull(tripId, "tripId is required");
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("An invoice needs at least one line");
        }
        Invoice invoice = new Invoice();
        invoice.id = UUID.randomUUID();
        invoice.number = number;
        invoice.status = InvoiceStatus.DRAFT;
        invoice.tripId = tripId;
        invoice.customerId = customerId;
        invoice.vehicleId = vehicleId;
        invoice.lines = List.copyOf(lines);
        invoice.subtotal = money(lines.stream().map(InvoiceLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add));
        invoice.taxRate = taxRate;
        invoice.taxAmount = money(invoice.subtotal.multiply(taxRate));
        invoice.total = invoice.subtotal.add(invoice.taxAmount);
        return invoice;
    }

    public void issue(LocalDate today, int paymentTermDays) {
        requireStatus(InvoiceStatus.DRAFT, "issued");
        if (paymentTermDays < 0 || paymentTermDays > MAX_PAYMENT_TERM_DAYS) {
            throw new IllegalArgumentException("Payment terms must be between 0 and %d days".formatted(MAX_PAYMENT_TERM_DAYS));
        }
        status = InvoiceStatus.ISSUED;
        issuedOn = today;
        dueDate = today.plusDays(paymentTermDays);
    }

    public void markPaid(LocalDate today, PaymentMethod method) {
        requireStatus(InvoiceStatus.ISSUED, "paid");
        status = InvoiceStatus.PAID;
        paidOn = today;
        paymentMethod = Objects.requireNonNull(method, "method is required");
    }

    public void voidInvoice(String reason) {
        if (status == InvoiceStatus.PAID || status == InvoiceStatus.VOID) {
            throw new BusinessRuleViolationException("Invoice %s is %s and cannot be voided".formatted(number, status));
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A reason is required to void an invoice");
        }
        status = InvoiceStatus.VOID;
        voidReason = reason.strip();
    }

    public boolean isOverdue(LocalDate today) {
        return status == InvoiceStatus.ISSUED && dueDate != null && dueDate.isBefore(today);
    }

    public boolean markOverdueNotified(Instant now) {
        if (overdueNotifiedAt != null) {
            return false;
        }
        overdueNotifiedAt = now;
        return true;
    }

    private void requireStatus(InvoiceStatus expected, String action) {
        if (status != expected) {
            throw new BusinessRuleViolationException("Invoice %s is %s and cannot be %s".formatted(number, status, action));
        }
    }

    static BigDecimal money(BigDecimal amount) {
        return amount.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
