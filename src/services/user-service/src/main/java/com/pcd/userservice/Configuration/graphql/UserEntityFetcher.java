package com.pcd.vehicles.Configuration;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.pcd.userservice.Entity.User;
import com.pcd.userservice.Service.UserService;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class UserEntityFetcher {
    private final UserService UserService;
    @DgsEntityFetcher(name = "User")
    public User fetch(Map<String, Object> values) {
        UUID id = UUID.fromString((String) values.get("id"));
        return UserService.findById(id);
    }
}