package com.pcd.userservice.Controller;

import com.netflix.graphql.dgs.*;
import com.pcd.userservice.Entity.DTO.UserDto;
import com.pcd.userservice.Entity.User;
import com.pcd.userservice.Service.Interface.UserServiceInt;
import lombok.RequiredArgsConstructor;
import org.dataloader.DataLoader;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@DgsComponent
@RequiredArgsConstructor
public class UserController {
    private final UserServiceInt userService;

    @DgsQuery(field = "users")
    public List<User> users() {
        return userService.getAllUsers();
    }

    @DgsMutation(field = "CreateUser")
    public User createUser(@InputArgument("userDto") UserDto userDto) {

        return userService.CreateUser(userDto);
    }

    @DgsMutation(field = "updateUser")
    public User updateUser(@InputArgument UUID id,
                           @InputArgument("input") UserDto input) {
        return userService.updateUser(id, input);
    }


    @DgsMutation(field = "deleteUser")
    public Boolean deleteUser(@InputArgument UUID id) {
        return  userService.deleteUser(id);
    }

    @DgsData(parentType = "User", field = "id")
    public CompletableFuture<UUID> id(DgsDataFetchingEnvironment dfe) {
        User user = dfe.getSource();
        DataLoader<UUID, UUID> loader = dfe.getDataLoader(UserDataLoder.class);
        return loader.load(user.getId());
    }

}
