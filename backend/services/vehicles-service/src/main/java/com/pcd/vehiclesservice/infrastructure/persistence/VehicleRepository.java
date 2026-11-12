package com.pcd.vehiclesservice.infrastructure.persistence;

import com.pcd.vehiclesservice.domain.Vehicle;
import com.pcd.vehiclesservice.domain.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID>, JpaSpecificationExecutor<Vehicle> {

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    Optional<Vehicle> findByVin(String vin);

    boolean existsByLicensePlateAndIdNot(String licensePlate, UUID id);

    boolean existsByVin(String vin);

    @Query("select v.status as status, count(v) as count from Vehicle v group by v.status")
    List<StatusCount> countByStatus();

    long countByCurrentTripIdIsNotNull();

    long countByNextMaintenanceDateLessThanEqual(LocalDate date);

    interface StatusCount {
        VehicleStatus getStatus();

        long getCount();
    }
}
