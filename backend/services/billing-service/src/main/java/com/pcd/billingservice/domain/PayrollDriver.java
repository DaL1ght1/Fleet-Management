package com.pcd.billingservice.domain;

import com.pcd.shared.payroll.PayCycle;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "payroll_drivers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PayrollDriver {

    @Id
    private UUID id;

    private String fullName;

    private LocalDate hireDate;

    private BigDecimal monthlySalary;

    private boolean deleted;

    private LocalDate payrollCursor;

    private Instant lastEventAt;

    public static PayrollDriver track(UUID id, LocalDate today) {
        PayrollDriver driver = new PayrollDriver();
        driver.id = id;
        driver.lastEventAt = Instant.EPOCH;
        driver.payrollCursor = today.minusDays(PayCycle.DAYS);
        return driver;
    }

    public void apply(Instant eventTime, String name, LocalDate hired, BigDecimal salary, boolean nowDeleted) {
        if (!eventTime.isAfter(lastEventAt)) {
            return;
        }
        lastEventAt = eventTime;
        fullName = name;
        hireDate = hired;
        monthlySalary = salary;
        deleted = nowDeleted;
    }

    public boolean isPaid() {
        return !deleted && hireDate != null && monthlySalary != null && monthlySalary.signum() > 0;
    }

    public List<LocalDate> duePaydays(LocalDate today) {
        if (!isPaid()) {
            return List.of();
        }
        LocalDate from = payrollCursor.isBefore(hireDate) ? hireDate.minusDays(1) : payrollCursor;
        return PayCycle.paydaysBetween(hireDate, from, today);
    }

    public void paidThrough(LocalDate payday) {
        if (payday.isAfter(payrollCursor)) {
            payrollCursor = payday;
        }
    }

    public Optional<LocalDate> nextPayday(LocalDate today) {
        return isPaid() ? Optional.of(PayCycle.nextPayday(hireDate, today.plusDays(1))) : Optional.empty();
    }
}
