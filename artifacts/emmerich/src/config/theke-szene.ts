// ─── Theke-Szenen-Konfiguration ───────────────────────────────────────────────
//
// EINZIGE STELLE zum Anpassen, wenn das Backdrop-Foto getauscht wird:
//   1. BACKDROP_URL  — Pfad zur Bilddatei unter public/
//   2. WALL_REGION   — Prozentbereich der schwarzen Bühnenöffnung (Rahmen hängen hier)
//   3. BAR_REGION    — Prozentbereich der Holz-Bühnenfront (Tresen)
//
// Aktuelles Bild: Saal Kapaunenberg — Kronleuchter oben, schwarze Bühnenöffnung
// mittig, warme Holzvertäfelung der Bühnenfront darunter.

export const THEKE_SZENE = {
  /** Pfad zum Kulissenfoto (Vite serviert aus public/) */
  BACKDROP_URL: "/theke-buehne.png",

  /**
   * Rückwand-Bereich: Rahmen hängen IN der schwarzen Bühnenöffnung.
   * Bühne horizontal 22–68 %, vertikal 33–78 %.
   */
  WALL_REGION: { top: 36, left: 25, width: 46, height: 38 },

  /**
   * Tresen-Bereich: Holz-Bühnenfront.
   * Vertikal ~79–93 %, fast volle Breite.
   */
  BAR_REGION:  { top: 80, left: 6, width: 88, height: 14 },
} as const;
