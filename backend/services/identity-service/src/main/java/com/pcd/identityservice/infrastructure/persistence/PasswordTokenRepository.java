package com.pcd.identityservice.infrastructure.persistence;

import com.pcd.identityservice.domain.PasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordTokenRepository extends JpaRepository<PasswordToken, UUID> {

    Optional<PasswordToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("delete from PasswordToken token where token.expiresAt < :threshold")
    int deleteExpiredBefore(Instant threshold);
}
