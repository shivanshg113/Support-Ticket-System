-- V1: Initial schema — tickets and comments tables
-- Managed by Flyway. Never edit this file after deployment.
-- To alter schema, create V2__description.sql

CREATE TABLE IF NOT EXISTS tickets (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255)                 NOT NULL,
    description TEXT                         NOT NULL,
    priority    VARCHAR(20)                  NOT NULL,
    status      VARCHAR(20)                  NOT NULL DEFAULT 'OPEN',
    assignee    VARCHAR(100)                 NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE    NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE    NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   BIGINT                       NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author      VARCHAR(100)                 NOT NULL,
    content     TEXT                         NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE    NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tickets_status     ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
