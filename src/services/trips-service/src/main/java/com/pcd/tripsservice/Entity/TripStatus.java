package com.pcd.tripsservice.Entity;

import lombok.Getter;



@Getter
public enum TripStatus {
    SCHEDULED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
