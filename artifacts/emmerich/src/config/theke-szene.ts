// ─── Theke-Szenen-Konfiguration ───────────────────────────────────────────────
//
// EINZIGE STELLE zum Anpassen, wenn das Backdrop-Foto getauscht wird:
//   1. BACKDROP_URL  — Pfad zur neuen Bilddatei unter public/theke/
//   2. WALL_REGION   — Prozentbereich der Rückwand im neuen Foto
//   3. BAR_REGION    — Prozentbereich des Tresens im neuen Foto
//
// Alle top/left/width/height-Werte sind Prozent der Bühnenabmessungen (0–100).
// Empfehlung: Bild in ≈ 1920 px Breite ablegen, JPEG, optimiert.
// Mehrere Hintergründe (je Phase) wären eine triviale Erweiterung — jetzt ein
// aktiver Backdrop.

export const THEKE_SZENE = {
  /** Pfad zum Kulissenfoto (Vite serviert aus public/theke/) */
  BACKDROP_URL: "/theke/backdrop.jpg",

  /** Rückwand-Bereich: hier hängen die Porträtrahmen (% der Bühne) */
  WALL_REGION: { top: 14, left: 5, width: 90, height: 44 },

  /** Tresen-Bereich: hier stehen Bierdeckel + Telefon (% der Bühne) */
  BAR_REGION:  { top: 62, left: 8, width: 84, height: 30 },
} as const;
