-- Migration: atomic ticket number counter table
-- Sichert fortlaufende, doppel-kollisionsfreie Ticket-Nummern via SELECT FOR UPDATE
CREATE TABLE IF NOT EXISTS ticket_nummer_counter (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  next_nummer   INTEGER NOT NULL DEFAULT 1
);

-- Initialisierung: genau eine Zeile; ggf. bestehende höchste Nummer berücksichtigen
INSERT INTO ticket_nummer_counter (id, next_nummer)
SELECT 1,
       COALESCE(
         (SELECT MAX(val::int) + 1
          FROM anmeldungen
          CROSS JOIN LATERAL jsonb_array_elements_text(ticket_nummern) AS t(val)),
         1
       )
ON CONFLICT (id) DO NOTHING;
