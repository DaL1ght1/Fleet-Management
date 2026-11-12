package com.pcd.vehiclesservice.application;

import com.pcd.vehiclesservice.domain.FuelType;
import com.pcd.vehiclesservice.domain.VehicleStatus;

public record VehicleCriteria(VehicleStatus status, FuelType fuelType, String search, Boolean maintenanceDue) {

    public static final VehicleCriteria ANY = new VehicleCriteria(null, null, null, null);
}
