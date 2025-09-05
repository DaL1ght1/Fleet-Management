package com.pcd.userservice.Configuration.graphql;


import com.pcd.userservice.Entity.User;
import com.pcd.userservice.Repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UserEntityResolver {
    private final UserRepository repo;

    public UserEntityResolver(UserRepository repo) {
        this.repo = repo;
    }

    public User findById(String id) {
        return repo.findById(UUID.fromString(id)).orElse(null);
    }
}
