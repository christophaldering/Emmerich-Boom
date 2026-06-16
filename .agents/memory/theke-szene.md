---
name: Theke-Szene Architektur
description: ThekePage.tsx — vollständige Kulissen-Bühne; kein Flip, kein Scrollen, Parallax
---

**Struktur (Kulissen-Bühne, aktuell):**
- `position: fixed, inset: 0` — die Bühne füllt den gesamten Viewport, kein Body-Scroll
- Backdrop-Schicht (`zIndex: 0`): Background-Image aus `THEKE_SZENE.BACKDROP_URL`; Fallback-Gradient wenn Bild fehlt; hidden `<img onError>` erkennt Ladefehler
- Tiefengradienten-Overlay (`zIndex: 1`): Decke + Boden abdunkeln, kein pointerEvents
- Grußzeile (`zIndex: 10`): oben, pointerEvents: none
- Wand-Region (`zIndex: 3`, `filter: blur(0.35px)`): absolut positioniert per `THEKE_SZENE.WALL_REGION` Prozent; enthält `PorträtStreifen` (horizontal overflow-x:auto)
- Tresen-Region (`zIndex: 5`, scharf): absolut positioniert per `THEKE_SZENE.BAR_REGION`; enthält `BierdeckelObjekt` + `TelefonObjekt`
- Phasen-Andeutungen (`zIndex: 4`, aria-hidden): Tür + Uhr unten, ambient
- Overlays (`FeedDetail`, `ProfilOverlay`, `TelefonOverlay`): `position: fixed, zIndex: 8000–9999`

**Config:** `src/config/theke-szene.ts` — EINZIGE Stelle für BACKDROP_URL + WALL_REGION + BAR_REGION

**Parallax:** `tiltX`/`tiltY` State in ThekePage(); RAF-Smoothing (0.08 lerp); `mousemove` + `deviceorientation`; `prefers-reduced-motion` + `hardwareConcurrency < 4` → deaktiviert/gedämpft. Backdrop bewegt sich am wenigsten (0.3×), Wand mittel (0.55×), Tresen am meisten (1.0×).

**Kein 3D-Flip:** `PorträtRahmen` zeigt Foto + Name; Tap → `setSelectedEntry` → `FeedDetail` overlay (unverändert)

**Backdrop-Datei:** `public/theke/backdrop.jpg` (Christoph legt ab); ohne Datei greift Fallback-Gradient automatisch

**Why:** HARDPROMPT "Die Theke als echter Raum (Kulissen-Bühne)" — keine Section-Headings, kein Grid, kein Tab-System, kein 3D-Flip. Alles ist in das Szenenbild eingebettet.

**How to apply:** Beim nächsten Umbau (Phase "Der Abend") BAR_REGION aktivieren, neues Backdrop mit Abend-Atmosphäre einhängen — nur THEKE_SZENE.ts ändern und neue Phase-Overlays als fixed panels hinzufügen.
