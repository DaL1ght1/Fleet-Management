package com.pcd.tripsservice.infrastructure.persistence;

import com.pcd.tripsservice.domain.FleetResource;
import com.pcd.tripsservice.domain.FleetResourceKind;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FleetResourceRepository extends JpaRepository<FleetResource, UUID> {

    List<FleetResource> findByKindAndAccountId(FleetResourceKind kind, UUID accountId);

    List<FleetResource> findByKindAndAssignableTrueOrderByDisplayNameAsc(FleetResourceKind kind);
}
