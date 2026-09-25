package com.stms.repository;

import com.stms.domain.Ticket;
import com.stms.domain.TicketPriority;
import com.stms.domain.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Single unified filter query replacing the 3 separate methods.
     * Null parameters are treated as "no filter" via IS NULL OR checks.
     * Sorting is delegated to the Pageable (supports createdAt, updatedAt, priority, status, id).
     */
    @Query("""
           SELECT t FROM Ticket t WHERE
           (:keyword IS NULL OR
                LOWER(t.title)       LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
           AND (:status   IS NULL OR t.status   = :status)
           AND (:priority IS NULL OR t.priority = :priority)
           AND (:assignee IS NULL OR LOWER(t.assignee) LIKE LOWER(CONCAT('%', :assignee, '%')))
           """)
    Page<Ticket> findByFilters(
            @Param("keyword")  String keyword,
            @Param("status")   TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("assignee") String assignee,
            Pageable pageable);

    // ─── Stats helpers ────────────────────────────────────────────────────────
    long countByStatus(TicketStatus status);
    long countByPriority(TicketPriority priority);
    long countByCreatedAtAfter(Instant since);
    long countByUpdatedAtAfterAndStatus(Instant since, TicketStatus status);
}
