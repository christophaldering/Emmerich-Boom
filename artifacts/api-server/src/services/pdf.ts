/**
 * generateTicketPDF — Stub (noch nicht implementiert)
 *
 * Generiert für eine Anmeldung eine PDF-Datei mit je zwei Seiten pro Person:
 *   Seite 1: Vorderseite (Poster links, Name, Datum/Ort, Ticket-Nummer, Rand-Zeile)
 *   Seite 2: Rückseite (Was dich erwartet, Hausregeln § 1–5, Veranstalter-Footer)
 *
 * Bei 3 Personen ergibt das 6 Seiten:
 *   Vorderseite 1, Rückseite 1, Vorderseite 2, Rückseite 2, Vorderseite 3, Rückseite 3
 * → Beidseitiger Druck direkt nutzbar.
 *
 * Format: A5 Querformat (148 × 210 mm), entspricht viewBox 0 0 900 340 bei ~150 DPI.
 *
 * Geplante Bibliotheken: pdfkit + svg-to-pdfkit
 * SVG-Quellen: TicketSVG.tsx (Vorderseite), TicketRueckseite.tsx (Rückseite)
 */
export async function generateTicketPDF(_anmeldungId: number): Promise<Buffer> {
  throw new Error(
    "generateTicketPDF: noch nicht implementiert — PDF-Generierung folgt in separatem Task",
  );
}
