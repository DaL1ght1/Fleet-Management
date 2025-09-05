package com.pcd.userservice.Repository;

import com.pcd.userservice.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
  @NonNull
  Optional<User> findById(@NonNull UUID id);
  void deleteById(@NonNull UUID id);
  boolean existsByEmail(String email);
}