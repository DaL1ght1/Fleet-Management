package com.pcd.billingservice.infrastructure.persistence;

import com.pcd.billingservice.domain.BilledCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BilledCustomerRepository extends JpaRepository<BilledCustomer, UUID> {

    List<BilledCustomer> findByAccountId(UUID accountId);
}
