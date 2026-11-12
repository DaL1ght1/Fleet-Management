package com.pcd.tripsservice.infrastructure.persistence;

import com.pcd.tripsservice.domain.KnownCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KnownCustomerRepository extends JpaRepository<KnownCustomer, UUID> {

    boolean existsByIdAndDeletedFalse(UUID id);

    List<KnownCustomer> findByAccountIdAndDeletedFalse(UUID accountId);
}
