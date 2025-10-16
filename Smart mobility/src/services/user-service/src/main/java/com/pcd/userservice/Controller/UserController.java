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

    // Customer queries (main functionality)
    @DgsQuery
    public List<User> customers(){
        return userService.getAllUsers();
    }
    
    @DgsQuery
    public User getCustomerById(@InputArgument UUID id) {
        return userService.getUserById(id);
    }
    
    // Legacy user queries for backwards compatibility
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

    // Customer mutations (main functionality)
    @DgsMutation
    public User createCustomer(@InputArgument("input") UserDto input) {
        return userService.CreateUser(input);
    }
    
    @DgsMutation
    public User updateCustomer(@InputArgument UUID id, @InputArgument("input") UserDto input) {
        return userService.updateUser(id, input);
    }
    
    @DgsMutation
    public Boolean deleteCustomer(@InputArgument UUID id) {
        return userService.deleteUser(id);
    }
    
    // Legacy user mutations for backwards compatibility
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
