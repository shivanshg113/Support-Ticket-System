package com.stms.dto;

/**
 * Response DTO for the GET /api/stats endpoint.
 * Aggregated counts — never includes entity IDs or sensitive data.
 */
public class StatsResponse {

    private long total;

    // By status
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long cancelled;

    // By priority
    private long low;
    private long medium;
    private long high;
    private long critical;

    // Recency
    private long createdLast24h;
    private long resolvedLast24h;

    public StatsResponse() {}

    public StatsResponse(long total,
                         long open, long inProgress, long resolved, long closed, long cancelled,
                         long low, long medium, long high, long critical,
                         long createdLast24h, long resolvedLast24h) {
        this.total         = total;
        this.open          = open;
        this.inProgress    = inProgress;
        this.resolved      = resolved;
        this.closed        = closed;
        this.cancelled     = cancelled;
        this.low           = low;
        this.medium        = medium;
        this.high          = high;
        this.critical      = critical;
        this.createdLast24h = createdLast24h;
        this.resolvedLast24h = resolvedLast24h;
    }

    public long getTotal()           { return total; }
    public long getOpen()            { return open; }
    public long getInProgress()      { return inProgress; }
    public long getResolved()        { return resolved; }
    public long getClosed()          { return closed; }
    public long getCancelled()       { return cancelled; }
    public long getLow()             { return low; }
    public long getMedium()          { return medium; }
    public long getHigh()            { return high; }
    public long getCritical()        { return critical; }
    public long getCreatedLast24h()  { return createdLast24h; }
    public long getResolvedLast24h() { return resolvedLast24h; }
}
