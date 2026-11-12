package com.pcd.billingservice.infrastructure;

import com.pcd.billingservice.application.BillingService;
import com.pcd.billingservice.application.ExpenseService;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BillingRuntime {

    private final BillingService billing;
    private final ExpenseService expenses;

    @KafkaListener(topics = Topics.TRIP_EVENTS)
    public void onTripEvent(TripEvent event) {
        billing.onTripEvent(event);
    }

    @KafkaListener(topics = Topics.CUSTOMER_EVENTS)
    public void onCustomerEvent(CustomerEvent event) {
        billing.onCustomerEvent(event);
    }

    @KafkaListener(topics = Topics.MAINTENANCE_EVENTS)
    public void onMaintenanceEvent(MaintenanceEvent event) {
        expenses.onMaintenanceEvent(event);
    }

    @KafkaListener(topics = Topics.DRIVER_EVENTS)
    public void onDriverEvent(DriverEvent event) {
        expenses.onDriverEvent(event);
    }

    @Scheduled(cron = "${smartstreet.billing.overdue-cron:0 5 * * * *}")
    public void hourly() {
        billing.flagOverdueInvoices();
        expenses.runPayroll();
    }
}
