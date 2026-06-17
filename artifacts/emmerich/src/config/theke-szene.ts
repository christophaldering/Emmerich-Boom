// ─── Theke-Szenen-Konfiguration ───────────────────────────────────────────────
//
// EINZIGE STELLE zum Anpassen, wenn das Backdrop-Foto getauscht wird:
//   1. BACKDROP_URL  — Pfad zur Bilddatei unter public/
//   2. WALL_REGION   — Prozentbereich der Rückwand im Foto
//   3. BAR_REGION    — Prozentbereich des Tresens im Foto
//
// Alle top/left/width/height-Werte sind Prozent der Bühnenabmessungen (0–100).
// Aktuelles Bild: orangefarbene Ziegelwand (oben ~65 %) +
// dunkle Holzvertäfelung / Tresen (unten ~35 %).

export const THEKE_SZENE = {
  /** Pfad zum Kulissenfoto (Vite serviert aus public/) */
  BACKDROP_URL: "/theke-wand-bg.png",

  /**
   * Rückwand-Bereich: hier hängen die Porträtrahmen.
   * Im aktuellen Bild füllt die Ziegelwand die oberen ~65 %.
   */
  WALL_REGION: { top: 4, left: 2, width: 96, height: 58 },

  /**
   * Tresen-Bereich: hier stehen Bierdeckel + Telefon.
   * Die Holzvertäfelung beginnt bei ca. y 65 %.
   */
  BAR_REGION:  { top: 63, left: 0, width: 100, height: 33 },
} as const;
