-- Migration: create anmeldung_tickets table
-- Executed manually via node/pg (drizzle-kit push is interactive-only in this env)
-- Run once against the target database before deploying backend changes.

CREATE TABLE IF NOT EXISTS anmeldung_tickets (
  id            SERIAL PRIMARY KEY,
  anmeldung_id  INTEGER NOT NULL REFERENCES anmeldungen(id),
  person_name   TEXT NOT NULL,
  ticket_nummer TEXT NOT NULL UNIQUE,
  ticket_code   TEXT NOT NULL UNIQUE,
  versendet_am  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anmeldung_tickets_anmeldung_id
  ON anmeldung_tickets(anmeldung_id);
