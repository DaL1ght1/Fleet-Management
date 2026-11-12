package com.pcd.userservice.infrastructure.persistence;

import com.pcd.userservice.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID>, JpaSpecificationExecutor<Customer> {

    boolean existsByEmailAndIdNot(String email, UUID id);

    Optional<Customer> findByAccountId(UUID accountId);

    Optional<Customer> findByEmail(String email);
}
