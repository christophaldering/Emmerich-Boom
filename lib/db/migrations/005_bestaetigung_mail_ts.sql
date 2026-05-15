-- Migration: Bestätigungsmail-Timestamp für Nachverfolgung
ALTER TABLE anmeldungen
  ADD COLUMN IF NOT EXISTS bestaetigungsmail_versendet_am TIMESTAMPTZ;
