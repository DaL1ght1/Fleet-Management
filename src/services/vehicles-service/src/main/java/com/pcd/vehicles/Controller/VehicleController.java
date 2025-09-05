package com.pcd.vehicles.Controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.vehicles.ApiResponse;
import com.pcd.vehicles.Entity.DTO.VehicleInput;
import com.pcd.vehicles.Entity.Enum.Status;
import com.pcd.vehicles.Entity.Vehicle;
import com.pcd.vehicles.Service.Interfaces.VehicleServicesImpl;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleServicesImpl vehicleService;

    @DgsQuery
    public ApiResponse<List<Vehicle>> getAllVehicle(){
       List<Vehicle> vehicles =  vehicleService.getAllVehicles();
         return new ApiResponse<>(true, "All Vehicles retrieved successfully", vehicles);
    }

    @DgsQuery
    public ApiResponse<Vehicle> getVehicleById(@InputArgument UUID id){
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return new ApiResponse<>(true,"vehicle with ID { "+id+" } retrieved successfully", vehicle);
    }

    @DgsQuery
    public ApiResponse<List<Vehicle>> getVehicleByLicensePlate(@InputArgument String licensePlate){
        List<Vehicle> vehicles = vehicleService.getVehicleByLicensePlate(licensePlate);
        return new ApiResponse<>(true,"vehicles with Licence Plate { "+licensePlate+" } retrieved successfully", vehicles);
    }
    @DgsQuery
    public ApiResponse<Vehicle> getVehicleByVin(@InputArgument String vin){
        Vehicle vehicle = vehicleService.getVehicleByVin(vin);
        return new ApiResponse<>(true,"vehicle with VIN { "+vin+" } retrieved successfully", vehicle);

    }
    @DgsQuery
    public ApiResponse<List<Vehicle>> getVehicleByMakeAndModel(@InputArgument String make, @InputArgument String model){
        List<Vehicle> vehicles = vehicleService.getVehicleByMakeAndModel(make, model);
        return new ApiResponse<>(true,"vehicles with make { "+make+" } and model { "+model+" } retrieved successfully", vehicles);
    }

    @DgsMutation
    public ApiResponse<Vehicle> registerVehicle(@InputArgument VehicleInput vehicle){
        Vehicle v = vehicleService.registerVehicle(vehicle);
        return new ApiResponse<>(true, "Vehicle registered successfully", v);
    }
    @DgsMutation
    public ApiResponse<Vehicle> updateVehicle(@InputArgument UUID id,@InputArgument VehicleInput vehicle){
        Vehicle v = vehicleService.updateVehicle(id, vehicle);
        return new ApiResponse<>(true, "Vehicle with ID { "+id+" } updated successfully", v);
    }
    @DgsMutation
    public ApiResponse<Void> updateVehicleStatus(@InputArgument UUID id,@InputArgument Status status){
        vehicleService.updateVehicleStatus(id, status);
        return new ApiResponse<>(true, "Vehicle status with ID { "+id+" } updated successfully", null);}

    @DgsMutation
    public ApiResponse<Long> changeVehicleMileage(@InputArgument UUID id,@InputArgument Long mileage){
        Long newMilage = vehicleService.changeVehicleMilage(id, mileage);
        return new ApiResponse<>(true, "Vehicle millage with ID { "+id+" } updated successfully", newMilage);}

    @DgsMutation
    public ApiResponse<Void> deleteVehicle(@InputArgument UUID id){
        vehicleService.deleteVehicle(id);
        return new ApiResponse<>(true, "Vehicle with ID { "+id+" } deleted successfully", null);
    }
}
