package com.pcd.identityservice.web;

import com.pcd.identityservice.application.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupJob {

    private final AccountService accounts;

    @Scheduled(cron = "${smartstreet.identity.cleanup-cron:0 15 3 * * *}")
    public void purgeExpiredTokens() {
        accounts.purgeExpiredTokens();
    }
}
