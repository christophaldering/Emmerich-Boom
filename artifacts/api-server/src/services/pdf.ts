/**
 * generateTicketPDF — Stub (noch nicht implementiert)
 *
 * Generiert für eine Anmeldung eine PDF-Datei mit je einem Ticket pro Person
 * auf einer eigenen A5-Querformat-Seite.
 *
 * Geplante Bibliotheken: pdfkit + svg-to-pdfkit
 * Wird aufgerufen sobald Mail-Versand (Resend) eingebaut ist.
 */
export async function generateTicketPDF(_anmeldungId: number): Promise<Buffer> {
  throw new Error(
    "generateTicketPDF: noch nicht implementiert — PDF-Generierung folgt mit Mail-Versand",
  );
}
