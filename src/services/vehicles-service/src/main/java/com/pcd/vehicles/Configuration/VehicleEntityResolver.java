package com.pcd.vehicles.Configuration;


import com.pcd.vehicles.Entity.Vehicle;
import com.pcd.vehicles.Repository.VehicleRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class VehicleEntityResolver {
    private final VehicleRepository repo;

    public VehicleEntityResolver(VehicleRepository repo) {
        this.repo = repo;
    }

    public Vehicle findById(String id) {
        return repo.findById(UUID.fromString(id)).orElse(null);
    }
}
