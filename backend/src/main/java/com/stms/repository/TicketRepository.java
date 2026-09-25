package com.stms.repository;

import com.stms.domain.Ticket;
import com.stms.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Returns all tickets whose title or description contains the keyword
     * (case-insensitive) AND whose status matches the given status.
     */
    @Query("SELECT t FROM Ticket t WHERE " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND t.status = :status " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> findByKeywordAndStatus(@Param("keyword") String keyword,
                                        @Param("status") TicketStatus status);

    /**
     * Returns all tickets whose title or description contains the keyword
     * (case-insensitive).
     */
    @Query("SELECT t FROM Ticket t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> findByKeyword(@Param("keyword") String keyword);

    /**
     * Returns all tickets with the given status, ordered by creation date descending.
     */
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    /**
     * Returns all tickets ordered by creation date descending.
     */
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
