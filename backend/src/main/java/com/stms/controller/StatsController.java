package com.stms.controller;

import com.stms.dto.StatsResponse;
import com.stms.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides aggregated ticket statistics for the dashboard.
 * Read-only endpoint — no mutations.
 */
@RestController
@RequestMapping("/api/stats")
@Tag(name = "Stats", description = "Aggregated ticket statistics for dashboards")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @Operation(summary = "Get aggregated ticket counts by status, priority and recency")
    @GetMapping
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }
}
