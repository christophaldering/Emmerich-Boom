// ─── Theke-Szenen-Konfiguration ───────────────────────────────────────────────
//
// EINZIGE STELLE zum Anpassen, wenn das Backdrop-Foto getauscht wird:
//   1. BACKDROP_URL  — Pfad zur Bilddatei unter public/
//   2. WALL_REGION   — Prozentbereich der schwarzen Bühnenöffnung (Rahmen hängen hier)
//   3. BAR_REGION    — Prozentbereich der Holz-Bühnenfront (Tresen)
//
// Aktuelles Bild: buehne-saal.png — breiter Saal, schwarze Bühne mittig,
// Holzfront darunter. Koordinaten exakt aus diesem Bild gemessen.

export const THEKE_SZENE = {
  /** Pfad zum Kulissenfoto (Vite serviert aus public/) */
  BACKDROP_URL: "/buehne-saal.png",

  /**
   * Rückwand-Bereich: Rahmen hängen IN der schwarzen Bühnenöffnung.
   * Bühne horizontal 20–84 %, vertikal 26–83 %.
   */
  WALL_REGION: { top: 27, left: 21, width: 62, height: 54 },

  /**
   * Tresen-Bereich: Holz-Bühnenfront.
   * Vertikal ~84–100 %, fast volle Breite.
   */
  BAR_REGION:  { top: 84, left: 5, width: 90, height: 16 },
} as const;
