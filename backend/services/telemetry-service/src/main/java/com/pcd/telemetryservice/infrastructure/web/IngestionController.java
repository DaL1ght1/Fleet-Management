package com.pcd.telemetryservice.infrastructure.web;

import com.pcd.telemetryservice.application.IngestionService;
import com.pcd.telemetryservice.domain.PositionReport;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ingest/v1")
@RequiredArgsConstructor
public class IngestionController {

    public static final String DEVICE_KEY_HEADER = "X-Device-Key";

    private final IngestionService ingestion;

    public record PositionBatch(List<PositionReport> positions) {
    }

    public record IngestionReceipt(int accepted) {
    }

    @PostMapping("/positions")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public IngestionReceipt ingest(@RequestHeader(value = DEVICE_KEY_HEADER, required = false) String deviceKey,
                                   @RequestBody PositionBatch batch) {
        List<PositionReport> reports = batch.positions() == null ? List.of() : batch.positions();
        return new IngestionReceipt(ingestion.ingest(deviceKey, reports));
    }
}
