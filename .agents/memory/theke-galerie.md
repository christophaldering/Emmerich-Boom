---
name: Theke Galerie
description: GalerieWand-Architektur — SVG-Rahmen, Parallax, Autoplay, Beispielprofile, Beamer-Modus
---

## Dateien
- `artifacts/emmerich/src/pages/Galerie.tsx` — GalerieWand + SvgBilderrahmen + PorträtKarte + BeispielDetailOverlay
- `artifacts/emmerich/src/pages/beispielProfile.ts` — BEISPIEL_PROFILE (5 Einträge) + LEER_RAHMEN + BEISPIEL_SCHWELLE=10

## Scroll-Mechanik
- Pointer-Events (setPointerCapture) für Touch + Maus — kein CSS-scroll-container
- `scrollOffset` State → alle Portraits positioniert per `left: physX - scrollOffset`
- Windowing: nur startIdx..endIdx + BUFFER=3 Items gerendert
- Bilder: `loading="lazy"`

## Parallax
- Backdrop-Image als `background-image` im GalerieWand-Container, `backgroundPositionX: -scrollOffset * 0.38`
- `backgroundRepeat: repeat-x`, `backgroundSize: auto 280%`, `backgroundPositionY: 28%`
- Filter: `brightness(0.28) blur(1.5px)` → dunkle, verschwommene Tiefe

## SVG-Rahmen
- `Math.abs(entry.id) % 4` → 0: klassisch (Eck-Rauten), 1: doppelt mit Spitzen, 2: oval, 3: barock (Eckreliefs + Mitteldiamanten)
- Deterministische Goldfarben — `glow=true` wenn anwesend (< 90s) → helleres Gold + galerieGlow-Animation
- Beispiel-Profile: gedämpfte Goldfarben (`isBeispiel=true`)

## Autoplay
- RAF-Schleife, 42 px/s, Ping-Pong an den Enden (autoplayDirRef)
- lastTRef für korrekte dt-Berechnung (tab-switch-cap: 60ms)
- `beamer=true` → autoplay startet sofort, kein Pause-Button, keine Overlays

## Beispiel-Profile
- `BEISPIEL_SCHWELLE = 10` — unter dieser Schwelle echte + Beispiele + LEER_RAHMEN
- Im Beamer-Modus: LEER_RAHMEN wird nicht angezeigt
- Klar als Beispiel markiert: BEISPIEL-Bändchen, gedämpfte Farben, eigener BeispielDetailOverlay
- LEER_RAHMEN (`id=-99, istLeerRahmen=true`) öffnet Bierdeckel/ProfilOverlay via `onDeinPlatzAntippen`

## Ken-Burns
- `isCenter && autoplay` → img erhält `animation: kenBurnsGalerie 9s ease-in-out alternate infinite`
- Animiert scale(1) → scale(1.08) mit leichtem translate

## Beamer-Seite (`/theke/wand`)
- ThekeWandPage.tsx nutzt GalerieWand mit `beamer` prop
- Feed-Refresh alle 60s
- Zeigt Beispielprofile wenn < SCHWELLE echte vorhanden

**Why:** PorträtStreifen war einfacher flex-scroll. GalerieWand braucht manuelle Pointer-Events weil:
1. CSS-Scroll würde parallax und windowing erschweren
2. Autoplay-RAF braucht Kontrolle über exakten Offset-Wert
