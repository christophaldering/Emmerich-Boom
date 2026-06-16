---
name: Theke DB Eigenheiten
description: Nicht-offensichtliche DB/Config-Details für die Theke
---

**Demo-Code:** "00000000DEADBEEF" (uppercase) — Einzige Wahrheit in config.ts SERVER_CONFIG.THEKE_DEMO_CODE. Auth schreibt intern immer toUpperCase(). Profil wird NICHT im Seed angelegt — erst beim ersten /api/theke/auth-Aufruf (mit bestaetigt: false). Nach einmaliger Namens-Bestätigung: bestaetigt: true in DB.

**Feed-Ausschluss Demo:** In GET /api/theke/feed: sql`NOT IN (SELECT id FROM anmeldung_tickets WHERE ticket_code = ${SERVER_CONFIG.THEKE_DEMO_CODE})`. Band/Einladungen/Versand ausgeschlossen durch denselben Mechanismus.

**thekeEinladungenTable:** Hat KEINE ticket_id-Spalte — Einladungen werden über ticket_codes jsonb-Array getrackt.

**Ping-Endpoint:** Ignoriert Demo-Ticket nicht explizit — UPDATE wird ausgeführt, aber das Profil erscheint nicht im Feed. Korrekt so.

**Why:** Überraschungsquellen beim Weiterentwickeln der Theke vermeiden.
