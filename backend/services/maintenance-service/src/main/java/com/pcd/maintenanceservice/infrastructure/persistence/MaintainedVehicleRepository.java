package com.pcd.maintenanceservice.infrastructure.persistence;

import com.pcd.maintenanceservice.domain.MaintainedVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MaintainedVehicleRepository extends JpaRepository<MaintainedVehicle, UUID> {

    boolean existsByIdAndDeletedFalse(UUID id);

    List<MaintainedVehicle> findByDeletedFalseAndNextMaintenanceDateLessThanEqual(LocalDate date);
}
