package com.pcd.tripsservice.domain;

import java.util.EnumSet;
import java.util.Set;

public enum TripStatus {
    SCHEDULED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    public static final Set<TripStatus> ACTIVE = EnumSet.of(SCHEDULED, IN_PROGRESS);
}
