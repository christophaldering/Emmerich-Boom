-- Migration: Anzeigenamen-Freigabe für Songwünsche (Admin-Workflow)
CREATE TABLE IF NOT EXISTS display_names (
  id              SERIAL PRIMARY KEY,
  source_type     TEXT NOT NULL,
  source_id       TEXT NOT NULL,
  raw_name        TEXT NOT NULL,
  song            TEXT NOT NULL,
  suggested_name  TEXT NOT NULL,
  approved_name   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT display_names_source_unique UNIQUE (source_type, source_id)
);
