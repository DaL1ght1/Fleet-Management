package com.pcd.tripsservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fleet_resources")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FleetResource {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private FleetResourceKind kind;

    private String displayName;

    private UUID accountId;

    private String status;

    private boolean assignable;

    private Instant lastEventAt;

    public static FleetResource track(UUID id, FleetResourceKind kind) {
        FleetResource resource = new FleetResource();
        resource.id = id;
        resource.kind = kind;
        resource.lastEventAt = Instant.EPOCH;
        return resource;
    }

    public boolean apply(Instant eventTime, String newDisplayName, String newStatus, boolean nowAssignable,
                         UUID linkedAccountId) {
        if (!eventTime.isAfter(lastEventAt)) {
            return false;
        }
        lastEventAt = eventTime;
        accountId = linkedAccountId;
        if (newDisplayName != null) {
            displayName = newDisplayName;
        }
        status = newStatus;
        assignable = nowAssignable;
        return true;
    }

    public String describe() {
        return displayName == null ? id.toString() : displayName;
    }
}
