package com.pcd.billingservice.application;

import com.pcd.billingservice.domain.Expense;
import com.pcd.billingservice.domain.ExpenseKind;
import com.pcd.billingservice.domain.ExpenseStatus;
import com.pcd.billingservice.domain.PaymentMethod;
import com.pcd.billingservice.domain.PayrollDriver;
import com.pcd.billingservice.infrastructure.persistence.ExpenseRepository;
import com.pcd.billingservice.infrastructure.persistence.PayrollDriverRepository;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.MaintenanceEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private static final int MAX_PAGE_SIZE = 100;

    private final ExpenseRepository expenses;
    private final PayrollDriverRepository drivers;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Page<Expense> search(ExpenseKind kind, ExpenseStatus status, int page, int size) {
        return expenses.search(kind, status, PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE)));
    }

    @Transactional(readOnly = true)
    public ExpenseStatistics statistics() {
        BigDecimal maintenanceUnpaid = expenses.total(ExpenseKind.MAINTENANCE, ExpenseStatus.UNPAID);
        BigDecimal salariesUnpaid = expenses.total(ExpenseKind.SALARY, ExpenseStatus.UNPAID);
        return new ExpenseStatistics(
                expenses.total(ExpenseKind.MAINTENANCE, null),
                maintenanceUnpaid,
                expenses.total(ExpenseKind.SALARY, null),
                salariesUnpaid,
                maintenanceUnpaid.add(salariesUnpaid),
                expenses.countByStatus(ExpenseStatus.UNPAID),
                expenses.paidSince(today().withDayOfMonth(1)));
    }

    @Transactional(readOnly = true)
    public List<UpcomingSalary> upcomingSalaries(int days) {
        LocalDate today = today();
        LocalDate horizon = today.plusDays(Math.clamp(days, 1, 366));
        return drivers.findByDeletedFalseAndMonthlySalaryNotNullOrderByFullNameAsc().stream()
                .flatMap(driver -> driver.nextPayday(today).stream()
                        .filter(payday -> !payday.isAfter(horizon))
                        .map(payday -> new UpcomingSalary(driver.getId(), driver.getFullName(), payday,
                                driver.getMonthlySalary())))
                .sorted(Comparator.comparing(UpcomingSalary::payday))
                .toList();
    }

    public Expense pay(UUID id, PaymentMethod method) {
        Expense expense = expenses.findById(id).orElseThrow(() -> new NotFoundException("Expense", id));
        expense.markPaid(today(), method);
        return expense;
    }

    public void onMaintenanceEvent(MaintenanceEvent event) {
        if (event.type() != MaintenanceEvent.Type.WORK_ORDER_COMPLETED || event.totalCost() == null
                || event.totalCost().signum() <= 0
                || expenses.existsByKindAndSourceId(ExpenseKind.MAINTENANCE, event.workOrderId())) {
            return;
        }
        LocalDate completedOn = event.completedOn() != null ? event.completedOn() : today();
        expenses.save(Expense.maintenance(event.workOrderId(), event.vehicleId(), event.title(), event.totalCost(),
                completedOn));
    }

    public void onDriverEvent(DriverEvent event) {
        PayrollDriver driver = drivers.findById(event.driverId())
                .orElseGet(() -> drivers.save(PayrollDriver.track(event.driverId(), today())));
        String name = event.firstName() == null ? null : "%s %s".formatted(event.firstName(), event.lastName());
        driver.apply(event.occurredAt(), name, event.hireDate(), event.monthlySalary(),
                event.type() == DriverEvent.Type.DRIVER_DELETED);
        accrue(driver, today());
    }

    public int runPayroll() {
        LocalDate today = today();
        return drivers.findByDeletedFalseAndMonthlySalaryNotNullOrderByFullNameAsc().stream()
                .mapToInt(driver -> accrue(driver, today))
                .sum();
    }

    private int accrue(PayrollDriver driver, LocalDate today) {
        int created = 0;
        for (LocalDate payday : driver.duePaydays(today)) {
            if (!expenses.existsByKindAndSourceIdAndDueDate(ExpenseKind.SALARY, driver.getId(), payday)) {
                expenses.save(Expense.salary(driver.getId(), driver.getFullName(), driver.getMonthlySalary(), payday));
                created++;
            }
            driver.paidThrough(payday);
        }
        return created;
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
