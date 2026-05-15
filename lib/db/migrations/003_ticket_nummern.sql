-- Migration: add ticket_nummern column to anmeldungen
-- Fortlaufende Einlass-Nummern (Array of int) pro Anmeldung, eine pro Person
ALTER TABLE anmeldungen ADD COLUMN IF NOT EXISTS ticket_nummern jsonb NOT NULL DEFAULT '[]';
