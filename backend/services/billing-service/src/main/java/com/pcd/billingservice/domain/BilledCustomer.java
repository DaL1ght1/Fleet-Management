package com.pcd.billingservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "billed_customers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BilledCustomer {

    @Id
    private UUID id;

    private UUID accountId;

    private Instant lastEventAt;

    public static BilledCustomer track(UUID id) {
        BilledCustomer customer = new BilledCustomer();
        customer.id = id;
        customer.lastEventAt = Instant.EPOCH;
        return customer;
    }

    public void apply(Instant eventTime, UUID linkedAccountId) {
        if (eventTime.isAfter(lastEventAt)) {
            lastEventAt = eventTime;
            accountId = linkedAccountId;
        }
    }
}
