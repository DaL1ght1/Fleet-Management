package com.pcd.notificationservice.infrastructure.persistence;

import com.pcd.notificationservice.domain.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RecipientRepository extends JpaRepository<Recipient, UUID> {

    List<Recipient> findByKindAndDeletedFalseAndLicenseExpiryDateLessThanEqual(Recipient.Kind kind, LocalDate date);
}
