package com.pcd.billingservice.api;

import com.pcd.billingservice.api.graphql.types.Customer;
import com.pcd.billingservice.api.graphql.types.Driver;
import com.pcd.billingservice.api.graphql.types.ExpensePage;
import com.pcd.billingservice.api.graphql.types.InvoiceFilter;
import com.pcd.billingservice.api.graphql.types.InvoicePage;
import com.pcd.billingservice.api.graphql.types.Trip;
import com.pcd.billingservice.api.graphql.types.Vehicle;
import com.pcd.billingservice.application.BillingStatistics;
import com.pcd.billingservice.application.ExpenseStatistics;
import com.pcd.billingservice.application.InvoiceCriteria;
import com.pcd.billingservice.application.UpcomingSalary;
import com.pcd.billingservice.domain.Expense;
import com.pcd.billingservice.domain.Invoice;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Mapper
public interface BillingGraphQlMapper {

    @Mapping(target = "trip", source = "tripId")
    @Mapping(target = "customer", source = "customerId")
    @Mapping(target = "vehicle", source = "vehicleId")
    @Mapping(target = "currency", constant = Invoice.CURRENCY)
    @Mapping(target = "overdue", expression = "java(invoice.isOverdue(today))")
    com.pcd.billingservice.api.graphql.types.Invoice toGraphQl(Invoice invoice, @Context LocalDate today);

    InvoiceCriteria toCriteria(InvoiceFilter filter);

    @Mapping(target = "vehicle", source = "vehicleId")
    @Mapping(target = "driver", source = "driverId")
    @Mapping(target = "workOrderId",
            expression = "java(expense.getKind() == com.pcd.billingservice.domain.ExpenseKind.MAINTENANCE ? expense.getSourceId() : null)")
    @Mapping(target = "currency", constant = Invoice.CURRENCY)
    @Mapping(target = "overdue", expression = "java(expense.isOverdue(today))")
    com.pcd.billingservice.api.graphql.types.Expense toGraphQl(Expense expense, @Context LocalDate today);

    default ExpensePage toExpensePage(Page<Expense> page, LocalDate today) {
        return ExpensePage.newBuilder()
                .items(page.getContent().stream().map(expense -> toGraphQl(expense, today)).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default com.pcd.billingservice.api.graphql.types.ExpenseStatistics toGraphQl(ExpenseStatistics statistics) {
        return com.pcd.billingservice.api.graphql.types.ExpenseStatistics.newBuilder()
                .maintenanceTotal(statistics.maintenanceTotal())
                .maintenanceUnpaid(statistics.maintenanceUnpaid())
                .salariesTotal(statistics.salariesTotal())
                .salariesUnpaid(statistics.salariesUnpaid())
                .unpaidTotal(statistics.unpaidTotal())
                .unpaidCount(Math.toIntExact(statistics.unpaidCount()))
                .paidThisMonth(statistics.paidThisMonth())
                .build();
    }

    default com.pcd.billingservice.api.graphql.types.UpcomingSalary toGraphQl(UpcomingSalary salary) {
        return com.pcd.billingservice.api.graphql.types.UpcomingSalary.newBuilder()
                .driver(toDriver(salary.driverId()))
                .driverName(salary.driverName())
                .payday(salary.payday())
                .amount(salary.amount())
                .build();
    }

    default Driver toDriver(UUID id) {
        return id == null ? null : Driver.newBuilder().id(id).build();
    }

    default InvoicePage toPage(Page<Invoice> page, LocalDate today) {
        return InvoicePage.newBuilder()
                .items(page.getContent().stream().map(invoice -> toGraphQl(invoice, today)).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default com.pcd.billingservice.api.graphql.types.BillingStatistics toGraphQl(BillingStatistics statistics) {
        return com.pcd.billingservice.api.graphql.types.BillingStatistics.newBuilder()
                .drafts(Math.toIntExact(statistics.drafts()))
                .outstanding(statistics.outstanding())
                .overdue(statistics.overdue())
                .overdueCount(Math.toIntExact(statistics.overdueCount()))
                .collectedThisMonth(statistics.collectedThisMonth())
                .build();
    }

    default Trip toTrip(UUID id) {
        return Trip.newBuilder().id(id).build();
    }

    default Customer toCustomer(UUID id) {
        return id == null ? null : Customer.newBuilder().id(id).build();
    }

    default Vehicle toVehicle(UUID id) {
        return id == null ? null : Vehicle.newBuilder().id(id).build();
    }

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }
}
