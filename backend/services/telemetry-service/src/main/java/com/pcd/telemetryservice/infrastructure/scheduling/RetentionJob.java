package com.pcd.telemetryservice.infrastructure.scheduling;

import com.pcd.telemetryservice.application.IngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RetentionJob {

    private final IngestionService ingestion;

    @Scheduled(cron = "${smartstreet.telemetry.retention-cron:0 30 2 * * *}")
    public void purgeExpiredPositions() {
        log.info("Removed {} expired positions", ingestion.purgeExpired());
    }
}
