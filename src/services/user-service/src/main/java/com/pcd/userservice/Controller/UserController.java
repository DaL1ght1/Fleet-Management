package com.pcd.userservice.Controller;

import com.netflix.graphql.dgs.*;
import com.pcd.userservice.Entity.DTO.UserDto;
import com.pcd.userservice.Entity.User;
import com.pcd.userservice.Service.Interface.UserServiceInt;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class UserController {
    private final UserServiceInt userService;

    @DgsQuery
    public List<User> users() {
        return userService.getAllUsers();
    }

    @DgsQuery
    public User getUserById(@InputArgument UUID id) {
        return userService.getUserById(id);
    }

    @DgsQuery
    public User driverByEmail(@InputArgument String email) {
        return userService.getUserByEmail(email);
    }

    @DgsMutation(field = "CreateUser")
    public User createUser(@InputArgument("userDto") UserDto userDto) {

        return userService.CreateUser(userDto);
    }

    @DgsMutation
    public User updateUser(@InputArgument UUID id,
                           @InputArgument("input") UserDto input) {
        return userService.updateUser(id, input);
    }


    @DgsMutation
    public Boolean deleteUser(@InputArgument UUID id) {
        return  userService.deleteUser(id);
    }



}
