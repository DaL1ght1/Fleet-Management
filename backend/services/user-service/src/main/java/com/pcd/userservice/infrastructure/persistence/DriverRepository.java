package com.pcd.userservice.infrastructure.persistence;

import com.pcd.userservice.domain.Driver;
import com.pcd.userservice.domain.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverRepository extends JpaRepository<Driver, UUID>, JpaSpecificationExecutor<Driver> {

    Optional<Driver> findByAccountId(UUID accountId);

    Optional<Driver> findByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    boolean existsByLicenseNumberAndIdNot(String licenseNumber, UUID id);

    boolean existsByAccountIdAndIdNot(UUID accountId, UUID id);

    @Query("select d.status as status, count(d) as count from Driver d group by d.status")
    List<StatusCount> countByStatus();

    long countByCurrentTripIdIsNotNull();

    @Query("""
            select count(d) from Driver d
            where d.status = com.pcd.userservice.domain.DriverStatus.ACTIVE
              and d.currentTripId is null
              and d.licenseExpiryDate >= :today
            """)
    long countAvailable(LocalDate today);

    long countByLicenseExpiryDateBetween(LocalDate from, LocalDate to);

    interface StatusCount {
        DriverStatus getStatus();

        long getCount();
    }
}
