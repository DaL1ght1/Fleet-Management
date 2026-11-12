package com.pcd.billingservice.application;

import com.pcd.billingservice.domain.BilledCustomer;
import com.pcd.billingservice.domain.Invoice;
import com.pcd.billingservice.domain.InvoiceLine;
import com.pcd.billingservice.domain.InvoiceStatus;
import com.pcd.billingservice.domain.PaymentMethod;
import com.pcd.billingservice.infrastructure.persistence.BilledCustomerRepository;
import com.pcd.billingservice.infrastructure.persistence.InvoiceRepository;
import com.pcd.billingservice.infrastructure.persistence.InvoiceSpecifications;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.InvoiceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "createdAt");

    private final InvoiceRepository invoices;
    private final BilledCustomerRepository customers;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Value("${smartstreet.billing.tax-rate:0.19}")
    private BigDecimal taxRate;

    @Transactional(readOnly = true)
    public Optional<Invoice> find(UUID id) {
        return invoices.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Invoice> forTrip(UUID tripId) {
        return invoices.findByTripId(tripId);
    }

    @Transactional(readOnly = true)
    public Page<Invoice> search(InvoiceCriteria criteria, int page, int size) {
        return invoices.findAll(InvoiceSpecifications.matching(criteria, today()), pageRequest(page, size));
    }

    @Transactional(readOnly = true)
    public Page<Invoice> visibleTo(UUID accountId, int page, int size) {
        List<UUID> customerIds = customers.findByAccountId(accountId).stream().map(BilledCustomer::getId).toList();
        return invoices.findAll(InvoiceSpecifications.visibleTo(customerIds), pageRequest(page, size));
    }

    @Transactional(readOnly = true)
    public BillingStatistics statistics() {
        LocalDate today = today();
        return new BillingStatistics(invoices.countByStatus(InvoiceStatus.DRAFT), invoices.outstanding(),
                invoices.overdueAmount(today), invoices.countByStatusAndDueDateBefore(InvoiceStatus.ISSUED, today),
                invoices.collectedSince(today.withDayOfMonth(1)));
    }

    public Invoice issue(UUID id, int paymentTermDays) {
        Invoice invoice = load(id);
        invoice.issue(today(), paymentTermDays);
        publish(InvoiceEvent.Type.INVOICE_ISSUED, invoice);
        return invoice;
    }

    public Invoice markPaid(UUID id, PaymentMethod method) {
        Invoice invoice = load(id);
        invoice.markPaid(today(), method);
        publish(InvoiceEvent.Type.INVOICE_PAID, invoice);
        return invoice;
    }

    public Invoice voidInvoice(UUID id, String reason) {
        Invoice invoice = load(id);
        invoice.voidInvoice(reason);
        publish(InvoiceEvent.Type.INVOICE_VOIDED, invoice);
        return invoice;
    }

    public void onTripEvent(TripEvent event) {
        if (event.type() != TripEvent.Type.TRIP_COMPLETED || invoices.existsByTripId(event.tripId())
                || event.totalCost() == null || event.totalCost().signum() <= 0) {
            return;
        }
        String number = "INV-%d-%06d".formatted(today().getYear(), invoices.nextNumber());
        Invoice invoice = invoices.save(Invoice.draft(number, event.tripId(), event.customerId(), event.vehicleId(),
                List.of(new InvoiceLine(describe(event), event.totalCost())), taxRate));
        publish(InvoiceEvent.Type.INVOICE_DRAFTED, invoice);
    }

    public void onCustomerEvent(CustomerEvent event) {
        customers.findById(event.customerId())
                .orElseGet(() -> customers.save(BilledCustomer.track(event.customerId())))
                .apply(event.occurredAt(), event.accountId());
    }

    public int flagOverdueInvoices() {
        List<Invoice> overdue = invoices.findByStatusAndDueDateBeforeAndOverdueNotifiedAtIsNull(InvoiceStatus.ISSUED,
                today());
        overdue.stream().filter(invoice -> invoice.markOverdueNotified(clock.instant()))
                .forEach(invoice -> publish(InvoiceEvent.Type.INVOICE_OVERDUE, invoice));
        return overdue.size();
    }

    private static String describe(TripEvent event) {
        String kind = event.kind() == null ? "Trip" : event.kind().name().charAt(0)
                + event.kind().name().substring(1).toLowerCase(Locale.ROOT) + " trip";
        return event.distanceKm() == null ? kind
                : "%s · %s km".formatted(kind, event.distanceKm().setScale(1, RoundingMode.HALF_UP).toPlainString());
    }

    private PageRequest pageRequest(int page, int size) {
        return PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), NEWEST_FIRST);
    }

    private Invoice load(UUID id) {
        return invoices.findById(id).orElseThrow(() -> new NotFoundException("Invoice", id));
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private void publish(InvoiceEvent.Type type, Invoice invoice) {
        events.publish(Topics.BILLING_EVENTS, invoice.getId().toString(), new InvoiceEvent(UUID.randomUUID(), type,
                clock.instant(), invoice.getId(), invoice.getNumber(), invoice.getTripId(), invoice.getCustomerId(),
                invoice.getTotal(), invoice.getDueDate()));
    }
}
