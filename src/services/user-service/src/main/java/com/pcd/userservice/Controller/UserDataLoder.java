package com.pcd.userservice.Controller;

import com.netflix.graphql.dgs.DgsDataLoader;
import com.pcd.userservice.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.dataloader.MappedBatchLoader;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

@DgsDataLoader
@RequiredArgsConstructor
public class UserDataLoder implements MappedBatchLoader<UUID, UUID> {
    private final UserService userService;
   @Override
    public CompletionStage<Map<UUID, UUID>> load(Set<UUID> keys) {
    return CompletableFuture.completedFuture(userService.batchGenerate(keys));
    }
}
