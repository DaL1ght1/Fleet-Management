package com.pcd.tripsservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "known_customers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KnownCustomer {

    @Id
    private UUID id;

    private UUID accountId;

    private boolean deleted;

    private Instant lastEventAt;

    public static KnownCustomer track(UUID id) {
        KnownCustomer customer = new KnownCustomer();
        customer.id = id;
        customer.lastEventAt = Instant.EPOCH;
        return customer;
    }

    public void apply(Instant eventTime, UUID linkedAccountId, boolean nowDeleted) {
        if (eventTime.isAfter(lastEventAt)) {
            lastEventAt = eventTime;
            accountId = linkedAccountId;
            deleted = nowDeleted;
        }
    }
}
