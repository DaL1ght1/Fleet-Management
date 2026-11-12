package com.pcd.userservice.application;

import com.pcd.userservice.domain.DriverStatus;

public record DriverCriteria(DriverStatus status, Boolean available, String search) {

    public static final DriverCriteria ANY = new DriverCriteria(null, null, null);
}
