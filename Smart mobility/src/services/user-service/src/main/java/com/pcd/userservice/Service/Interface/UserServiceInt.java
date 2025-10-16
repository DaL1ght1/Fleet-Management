package com.pcd.userservice.Service.Interface;

import com.pcd.userservice.Entity.DTO.UserDto;
import com.pcd.userservice.Entity.User;

import java.util.List;
import java.util.UUID;

public interface UserServiceInt {
    boolean userExists(UUID userId);
    List<User> getAllUsers();
    User getUserById(UUID userId);
    User getUserByEmail(String email);
    User CreateUser(UserDto user);

    Boolean deleteUser(UUID id);

    User updateUser(UUID id, UserDto input);

}
