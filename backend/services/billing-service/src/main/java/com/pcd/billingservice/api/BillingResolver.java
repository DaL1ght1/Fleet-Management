package com.pcd.billingservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.billingservice.api.graphql.types.BillingStatistics;
import com.pcd.billingservice.api.graphql.types.Expense;
import com.pcd.billingservice.api.graphql.types.ExpenseFilter;
import com.pcd.billingservice.api.graphql.types.ExpensePage;
import com.pcd.billingservice.api.graphql.types.ExpenseStatistics;
import com.pcd.billingservice.api.graphql.types.Invoice;
import com.pcd.billingservice.api.graphql.types.InvoiceFilter;
import com.pcd.billingservice.api.graphql.types.InvoicePage;
import com.pcd.billingservice.api.graphql.types.PaymentMethod;
import com.pcd.billingservice.api.graphql.types.Trip;
import com.pcd.billingservice.api.graphql.types.UpcomingSalary;
import com.pcd.billingservice.application.BillingService;
import com.pcd.billingservice.application.ExpenseService;
import com.pcd.billingservice.application.InvoiceCriteria;
import com.pcd.billingservice.domain.ExpenseKind;
import com.pcd.billingservice.domain.ExpenseStatus;
import com.pcd.shared.security.CurrentAccount;
import com.pcd.shared.security.ManagerOrAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class BillingResolver {

    private final BillingService billing;
    private final ExpenseService expenses;
    private final BillingGraphQlMapper mapper;
    private final Clock clock;

    @DgsQuery
    @ManagerOrAdmin
    public Invoice invoice(@InputArgument UUID id) {
        return billing.find(id).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @ManagerOrAdmin
    public InvoicePage invoices(@InputArgument InvoiceFilter filter, @InputArgument Integer page,
                                @InputArgument Integer size) {
        InvoiceCriteria criteria = filter == null ? InvoiceCriteria.ANY : mapper.toCriteria(filter);
        return mapper.toPage(billing.search(criteria, page, size), today());
    }

    @DgsQuery
    @ManagerOrAdmin
    public BillingStatistics billingStatistics() {
        return mapper.toGraphQl(billing.statistics());
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public InvoicePage myInvoices(@InputArgument Integer page, @InputArgument Integer size) {
        UUID accountId = CurrentAccount.id().orElseThrow(() -> new AccessDeniedException("No account"));
        return mapper.toPage(billing.visibleTo(accountId, page, size), today());
    }

    @DgsQuery
    @ManagerOrAdmin
    public ExpensePage expenses(@InputArgument ExpenseFilter filter, @InputArgument Integer page,
                                @InputArgument Integer size) {
        ExpenseKind kind = filter == null || filter.getKind() == null ? null
                : ExpenseKind.valueOf(filter.getKind().name());
        ExpenseStatus status = filter == null || filter.getStatus() == null ? null
                : ExpenseStatus.valueOf(filter.getStatus().name());
        return mapper.toExpensePage(expenses.search(kind, status, page, size), today());
    }

    @DgsQuery
    @ManagerOrAdmin
    public ExpenseStatistics expenseStatistics() {
        return mapper.toGraphQl(expenses.statistics());
    }

    @DgsQuery
    @ManagerOrAdmin
    public List<UpcomingSalary> upcomingSalaries(@InputArgument Integer days) {
        return expenses.upcomingSalaries(days).stream().map(mapper::toGraphQl).toList();
    }

    @DgsMutation
    @ManagerOrAdmin
    public Expense payExpense(@InputArgument UUID id, @InputArgument PaymentMethod method) {
        return mapper.toGraphQl(expenses.pay(id, com.pcd.billingservice.domain.PaymentMethod.valueOf(method.name())),
                today());
    }

    @DgsData(parentType = "Trip", field = "invoice")
    @ManagerOrAdmin
    public Invoice tripInvoice(DgsDataFetchingEnvironment environment) {
        return billing.forTrip(environment.<Trip>getSource().getId()).map(this::toGraphQl).orElse(null);
    }

    @DgsMutation
    @ManagerOrAdmin
    public Invoice issueInvoice(@InputArgument UUID id, @InputArgument Integer paymentTermDays) {
        return toGraphQl(billing.issue(id, paymentTermDays));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Invoice markInvoicePaid(@InputArgument UUID id, @InputArgument PaymentMethod method) {
        return toGraphQl(billing.markPaid(id, com.pcd.billingservice.domain.PaymentMethod.valueOf(method.name())));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Invoice voidInvoice(@InputArgument UUID id, @InputArgument String reason) {
        return toGraphQl(billing.voidInvoice(id, reason));
    }

    @DgsEntityFetcher(name = "Trip")
    public Trip tripReference(Map<String, Object> representation) {
        return mapper.toTrip(UUID.fromString(String.valueOf(representation.get("id"))));
    }

    @DgsEntityFetcher(name = "Invoice")
    public Invoice invoiceReference(Map<String, Object> representation) {
        return billing.find(UUID.fromString(String.valueOf(representation.get("id")))).map(this::toGraphQl)
                .orElse(null);
    }

    private Invoice toGraphQl(com.pcd.billingservice.domain.Invoice invoice) {
        return mapper.toGraphQl(invoice, today());
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
