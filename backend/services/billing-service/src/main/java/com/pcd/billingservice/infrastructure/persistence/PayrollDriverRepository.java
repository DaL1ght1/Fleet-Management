package com.pcd.billingservice.infrastructure.persistence;

import com.pcd.billingservice.domain.PayrollDriver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PayrollDriverRepository extends JpaRepository<PayrollDriver, UUID> {

    List<PayrollDriver> findByDeletedFalseAndMonthlySalaryNotNullOrderByFullNameAsc();
}
