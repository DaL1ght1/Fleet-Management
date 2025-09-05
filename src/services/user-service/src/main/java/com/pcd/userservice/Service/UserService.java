package com.pcd.userservice.Service;

import com.pcd.userservice.Entity.DTO.UserDto;
import com.pcd.userservice.Entity.User;
import com.pcd.userservice.Exception.UserNotFoundException;
import com.pcd.userservice.Repository.UserRepository;
import com.pcd.userservice.Service.Interface.UserServiceInt;
import io.micrometer.common.util.StringUtils;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import static java.lang.String.format;

@Service
@RequiredArgsConstructor
public class UserService implements UserServiceInt {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Logger logger = Logger.getLogger(UserService.class.getName());

    @Override
    public boolean userExists(UUID userId) {
        return userRepository.findById(userId).isPresent();
    }
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    @Override
    public User getUserById(UUID userId) {
        return userRepository.findById(userId).orElse(null);
    }

    @Override
    public Boolean deleteUser(UUID userId) {
        try {
            userRepository.deleteById(userId);
            return true;
        }
        catch (Exception e) {
            throw new UserNotFoundException(
                    format("Cannot Delete user: User with id %s not found",userId)
            );
    }}

    @Override
    public User updateUser(UUID id, UserDto request) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        format("Cannot Update user: User with id %s not found",id)
                ));
        mergeUser(user, request);
        return userRepository.save(user);
    }


    public Map<UUID,UUID> batchGenerate(Set<UUID> ids) {
        logger.info("Batch generating new IDs for users: " + ids);
        try {
            TimeUnit.SECONDS.sleep(1);
        }
        catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        Map<UUID, UUID> result =new HashMap<>();
        ids.forEach(key-> result.put(key,generate(key)));
        return result;


    }

    @Override
    public UUID generateNewId(UUID id) {
        logger.info("Generating new ID for user: " + id);
        try {
            TimeUnit.SECONDS.sleep(1);
        }
        catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return generate(id);
    }
    @NonNull
    private static UUID generate(UUID id) {
        return UUID.randomUUID();
    }

    public void mergeUser(User user, UserDto request) {
        if (StringUtils.isNotBlank(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.isNotBlank(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (StringUtils.isNotBlank(request.getEmail())) {
            user.setEmail(request.getEmail());
        }
        if (StringUtils.isNotBlank(request.getPassword())) {
            if (request.getPassword().length() < 8) {
                throw new IllegalArgumentException("Password must be at least 8 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (StringUtils.isNotBlank(request.getRole().toString())) {
            user.setRole(request.getRole());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

    }

    @Override
    public User CreateUser(UserDto request) {
        User user = request.toUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }



}
