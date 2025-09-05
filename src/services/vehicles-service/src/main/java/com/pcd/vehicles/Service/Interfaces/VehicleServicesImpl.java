package com.pcd.vehicles.Service.Interfaces;

import com.pcd.vehicles.Entity.DTO.VehicleInput;
import com.pcd.vehicles.Entity.Enum.Status;
import com.pcd.vehicles.Entity.Vehicle;

import java.util.List;
import java.util.UUID;

public interface VehicleServicesImpl {
    List<Vehicle> getAllVehicles();

    Vehicle getVehicleById(UUID id);

    List<Vehicle> getVehicleByLicensePlate(String LicensePlate);

    Vehicle getVehicleByVin(String vin);

    List<Vehicle> getVehicleByMakeAndModel(String make, String model);

    Vehicle registerVehicle(VehicleInput vehicle);

    Vehicle updateVehicle(UUID id, VehicleInput vehicle);

    void updateVehicleStatus(UUID id, Status status);

    Long changeVehicleMilage(UUID id, Long milage);

    void deleteVehicle(UUID id);
}
