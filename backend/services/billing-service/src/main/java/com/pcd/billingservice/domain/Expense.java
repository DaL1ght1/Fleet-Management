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
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Expense {

    @Id
    private UUID id;

    @Version
    private long version;

    @Enumerated(EnumType.STRING)
    private ExpenseKind kind;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;

    private UUID sourceId;

    private UUID vehicleId;

    private UUID driverId;

    private String description;

    private BigDecimal amount;

    private LocalDate dueDate;

    private LocalDate paidOn;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Expense maintenance(UUID workOrderId, UUID vehicleId, String title, BigDecimal amount,
                                      LocalDate completedOn) {
        Expense expense = create(ExpenseKind.MAINTENANCE, workOrderId, title, amount, completedOn);
        expense.vehicleId = vehicleId;
        return expense;
    }

    public static Expense salary(UUID driverId, String driverName, BigDecimal amount, LocalDate payday) {
        Expense expense = create(ExpenseKind.SALARY, driverId, driverName, amount, payday);
        expense.driverId = driverId;
        return expense;
    }

    public void markPaid(LocalDate today, PaymentMethod method) {
        if (status == ExpenseStatus.PAID) {
            throw new BusinessRuleViolationException("This expense is already paid");
        }
        status = ExpenseStatus.PAID;
        paidOn = today;
        paymentMethod = Objects.requireNonNull(method, "method is required");
    }

    public boolean isOverdue(LocalDate today) {
        return status == ExpenseStatus.UNPAID && dueDate.isBefore(today);
    }

    private static Expense create(ExpenseKind kind, UUID sourceId, String description, BigDecimal amount,
                                  LocalDate dueDate) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("An expense needs a positive amount");
        }
        Expense expense = new Expense();
        expense.id = UUID.randomUUID();
        expense.kind = kind;
        expense.status = ExpenseStatus.UNPAID;
        expense.sourceId = Objects.requireNonNull(sourceId, "sourceId is required");
        expense.description = description;
        expense.amount = amount.setScale(3, RoundingMode.HALF_UP);
        expense.dueDate = Objects.requireNonNull(dueDate, "dueDate is required");
        return expense;
    }
}
