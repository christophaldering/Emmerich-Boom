---
name: Theke Ping + Presence
description: Anwesenheits-Puls: Ping-Endpoint, DB-Spalte, Frontend-Logik
---

**DB:** theke_profile.zuletzt_gesehen_am (timestamp nullable)

**Backend:** POST /api/theke/ping → db.update(thekeProfileTable).set({zuletzt_gesehen_am: new Date()}); kein Fehler bei fehlendem Profil (UPDATE 0 Zeilen = OK)

**Frontend-Timing:** ping alle 25s; feed reload alle 60s; feedNow-Zähler alle 15s (für Echtzeit-Aktualisierung der Anwesenheitsanzeige ohne Feed-Reload)

**Schwellwert:** < 90_000ms = "anwesend" (orangefarbener Puls-Dot auf Gesichtskarte + Glüheffekt)

**Why:** Einfache Presence-Anzeige ohne WebSocket. Demo-Ticket pingt auch, erscheint aber nicht im Feed (bereits vor dieser Änderung ausgeschlossen).

**How to apply:** Beim nächsten Presence-Feature (z.B. "wer ist gerade im Raum"): feedNow state + feed.filter(e => zuletzt_gesehen_am < 90s) nutzen.
