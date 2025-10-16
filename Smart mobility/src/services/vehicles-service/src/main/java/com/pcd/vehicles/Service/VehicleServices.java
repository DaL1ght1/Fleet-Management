package com.pcd.vehicles.Service;


import com.pcd.vehicles.Entity.DTO.VehicleInput;
import com.pcd.vehicles.Entity.Enum.Status;
import com.pcd.vehicles.Entity.Vehicle;
import com.pcd.vehicles.Repository.VehicleRepository;
import com.pcd.vehicles.Service.Interfaces.VehicleServicesImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.pcd.vehicles.exceptions.VehicleNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.pcd.vehicles.Entity.Enum.Status.MAINTENANCE;

@Service
@RequiredArgsConstructor
public class VehicleServices implements VehicleServicesImpl {

    private final VehicleRepository vehicleRepository;

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Vehicle getVehicleById(UUID id) {
        return vehicleRepository.findById(id).orElseThrow(()-> new VehicleNotFoundException("Vehicle not found with this ID"));
    }

    @Override
    public List<Vehicle> getVehicleByLicensePlate(String LicensePlate){
        Optional<Vehicle> vehicle = vehicleRepository.findByLicensePlate(LicensePlate);
        if(vehicle.isPresent()){
            return List.of(vehicle.get());
        }else{
            throw new VehicleNotFoundException("Vehicle not found with this License Plate");
        }
    }

    @Override
    public Vehicle getVehicleByVin(String vin){
        Optional<Vehicle> vehicle = vehicleRepository.findAll().stream().filter(v -> v.getVin().equals(vin)).findFirst();
        if(vehicle.isPresent()){
            return vehicle.get();
        }else{
            throw new VehicleNotFoundException("Vehicle not found with this VIN");
        }
    }

    @Override
    public List<Vehicle> getVehicleByMakeAndModel(String make, String model){
        List<Vehicle> vehicles = vehicleRepository.findAll().stream().filter(v -> v.getMake().equalsIgnoreCase(make) && v.getModel().equalsIgnoreCase(model)).toList();
        if(vehicles.isEmpty()){
            throw new VehicleNotFoundException("No vehicles found with this make and model");
        }
        return vehicles;
    }

    @Override
    public Vehicle registerVehicle(VehicleInput vehicle) {
        Vehicle v = vehicle.toVehicle();
        v.setNextMaintenanceDate(v.getLastMaintenanceDate().plusDays(v.getMaintenanceIntervalDays()));
        return vehicleRepository.save(v);
    }

    @Override
    public Vehicle updateVehicle(UUID id, VehicleInput vehicle){
        Vehicle v = getVehicleById(id);
        if(vehicle.getMake() != null) v.setMake(vehicle.getMake());
        if(vehicle.getModel() != null) v.setModel(vehicle.getModel());
        if(vehicle.getYear() != 0) v.setYear(vehicle.getYear());
        if(vehicle.getLicensePlate() != null) v.setLicensePlate(vehicle.getLicensePlate());
        if(vehicle.getStatus() != null) v.setStatus(vehicle.getStatus());
        if(vehicle.getVin() != null) v.setVin(vehicle.getVin());
        if(vehicle.getColor() != null) v.setColor(vehicle.getColor());
        if(vehicle.getMileage() != null) v.setMileage(vehicle.getMileage());
        if(vehicle.getFuelType() != null) v.setFuelType(vehicle.getFuelType());
        if(vehicle.getSeatingCapacity() != 0) v.setSeatingCapacity(vehicle.getSeatingCapacity());
        if(vehicle.getRentalPricePerDay() != 0) v.setRentalPricePerDay(vehicle.getRentalPricePerDay());
        v.setGpsEnabled(vehicle.isGpsEnabled());
        if(vehicle.getLastMaintenanceDate() != null) v.setLastMaintenanceDate(vehicle.getLastMaintenanceDate());
        if(vehicle.getMaintenanceIntervalDays() != 0) v.setMaintenanceIntervalDays(vehicle.getMaintenanceIntervalDays());
        if(vehicle.getNextMaintenanceDate() != null) v.setNextMaintenanceDate(vehicle.getNextMaintenanceDate());
        return vehicleRepository.save(v);
    }

    @Override
    public void updateVehicleStatus(UUID id, Status status){
        Vehicle vehicle = getVehicleById(id);
        vehicle.setStatus(status);
        if(status == MAINTENANCE){
            vehicle.setNextMaintenanceDate(LocalDate.now().plusDays(vehicle.getMaintenanceIntervalDays()));
            vehicle.setLastMaintenanceDate(LocalDate.now());
        }
        vehicleRepository.save(vehicle);
    }

    @Override
    public Long changeVehicleMilage(UUID id, Long milage){
        Vehicle vehicle = getVehicleById(id);
        var newMilage = vehicle.getMileage() + milage;
        vehicle.setMileage(newMilage);
        vehicleRepository.save(vehicle);
        return newMilage;
    }

    @Override
    public void deleteVehicle(UUID id) {
        Vehicle v = getVehicleById(id);
        vehicleRepository.delete(v);
    }

    public Vehicle findById(UUID id) {
        return vehicleRepository.findById(id).orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with this ID"));
    }
}
