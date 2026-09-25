package com.stms.service;

import com.stms.domain.TicketPriority;
import com.stms.domain.TicketStatus;
import com.stms.dto.StatsResponse;
import com.stms.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Provides aggregated statistics over the ticket dataset.
 * All queries are read-only.
 */
@Service
@Transactional(readOnly = true)
public class StatsService {

    private final TicketRepository ticketRepository;

    public StatsService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public StatsResponse getStats() {
        Instant since24h = Instant.now().minus(24, ChronoUnit.HOURS);

        return new StatsResponse(
                ticketRepository.count(),
                ticketRepository.countByStatus(TicketStatus.OPEN),
                ticketRepository.countByStatus(TicketStatus.IN_PROGRESS),
                ticketRepository.countByStatus(TicketStatus.RESOLVED),
                ticketRepository.countByStatus(TicketStatus.CLOSED),
                ticketRepository.countByStatus(TicketStatus.CANCELLED),
                ticketRepository.countByPriority(TicketPriority.LOW),
                ticketRepository.countByPriority(TicketPriority.MEDIUM),
                ticketRepository.countByPriority(TicketPriority.HIGH),
                ticketRepository.countByPriority(TicketPriority.CRITICAL),
                ticketRepository.countByCreatedAtAfter(since24h),
                ticketRepository.countByUpdatedAtAfterAndStatus(since24h, TicketStatus.RESOLVED)
        );
    }
}
