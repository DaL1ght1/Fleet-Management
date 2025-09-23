package com.pcd.userservice.Repository;

import com.pcd.userservice.Entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {

    Optional<Driver> findByEmail(String email);

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    List<Driver> findByStatus(Driver.DriverStatus status);

    @Query("SELECT d FROM Driver d WHERE d.status = 'ACTIVE' AND d.currentTripId IS NULL")
    List<Driver> findAvailableDrivers();


    @Query("SELECT d FROM Driver d WHERE d.status = 'ACTIVE' AND d.currentTripId IS NOT NULL")
    List<Driver> findBusyDrivers();


    @Query("SELECT d FROM Driver d WHERE " +
           "LOWER(CONCAT(d.firstName, ' ', d.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Driver> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query(value = "SELECT * FROM drivers d WHERE d.license_expiry_date <= CURRENT_DATE + CAST(:days || ' days' AS INTERVAL)", nativeQuery = true)
    List<Driver> findDriversWithLicenseExpiringWithin(@Param("days") long days);


    long countByStatus(Driver.DriverStatus status);


    @Query("SELECT COUNT(d) FROM Driver d WHERE d.status = 'ACTIVE' AND d.currentTripId IS NULL")
    long countAvailableDrivers();


    @Query("SELECT COUNT(d) FROM Driver d WHERE d.status = 'ACTIVE' AND d.currentTripId IS NOT NULL")
    long countBusyDrivers();
}