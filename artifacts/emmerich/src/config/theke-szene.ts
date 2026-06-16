// ─── Theke-Szenen-Konfiguration ───────────────────────────────────────────────
//
// EINZIGE STELLE zum Anpassen, wenn das Backdrop-Foto getauscht wird:
//   1. BACKDROP_URL  — Pfad zur neuen Bilddatei unter public/theke/
//   2. WALL_REGION   — Prozentbereich der Rückwand im neuen Foto
//   3. BAR_REGION    — Prozentbereich des Tresens im neuen Foto
//
// Alle top/left/width/height-Werte sind Prozent der Bühnenabmessungen (0–100).
// Aktuelles Bild: atmosphärischer Pub-Raum mit leeren Bilderrahmen an der
// Ziegelwand (Mitte-rechts) und hölzernem Tresen im Vordergrund (links).

export const THEKE_SZENE = {
  /** Pfad zum Kulissenfoto (Vite serviert aus public/theke/) */
  BACKDROP_URL: "/theke/backdrop.jpg",

  /**
   * Rückwand-Bereich: hier hängen die Porträtrahmen.
   * Im aktuellen Bild sind die leeren Goldrahmen ca. bei
   *   x: 24 %–88 %,  y: 8 %–62 %
   */
  WALL_REGION: { top: 8, left: 24, width: 64, height: 52 },

  /**
   * Tresen-Bereich: hier stehen Bierdeckel + Telefon.
   * Im aktuellen Bild beginnt die sichtbare Tresenplatte bei ca. y 57 %,
   * läuft bis ca. y 83 %, horizontal links bis ca. 70 %.
   */
  BAR_REGION:  { top: 57, left: 3, width: 66, height: 28 },
} as const;
