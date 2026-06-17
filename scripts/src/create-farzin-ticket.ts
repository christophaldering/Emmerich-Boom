import { db, anmeldungenTable, anmeldungTicketsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const FARZIN_EMAIL   = "akyel.events@gmail.com";
const FARZIN_CODE    = "FARZIN2026PREV00";
const FARZIN_NUMMER  = "PREV-0001";
const FARZIN_NAME    = "Farzin";

async function run() {
  const existing = await db
    .select()
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, FARZIN_CODE));

  if (existing.length > 0) {
    console.log("✓ Farzin-Ticket existiert bereits:", existing[0]);
    process.exit(0);
  }

  const [anmeldung] = await db
    .insert(anmeldungenTable)
    .values({
      email:           FARZIN_EMAIL,
      telefon:         null,
      personen_anzahl: 1,
      personen:        [{ name: FARZIN_NAME }],
      bezahlweg:       "freiticket",
      song:            null,
      statement:       "Vorschau-Zugang (nicht zählen)",
      betrag_gesamt:   0,
      ticket_nummern:  [FARZIN_NUMMER],
      bezahlt_am:      new Date(),
    })
    .returning();

  if (!anmeldung) throw new Error("Anmeldung-Insert fehlgeschlagen");

  const [ticket] = await db
    .insert(anmeldungTicketsTable)
    .values({
      anmeldung_id:  anmeldung.id,
      person_name:   FARZIN_NAME,
      ticket_nummer: FARZIN_NUMMER,
      ticket_code:   FARZIN_CODE,
    })
    .returning();

  console.log("✓ Farzin-Ticket angelegt:");
  console.log("  Anmeldung-ID:", anmeldung.id);
  console.log("  Ticket-ID:   ", ticket.id);
  console.log("  Ticket-Code: ", ticket.ticket_code);
  console.log("  Nummer:      ", ticket.ticket_nummer);
  console.log("  Theke-URL:   https://emmerich-boomt.de/theke?t=" + FARZIN_CODE);
}

run().catch(e => { console.error(e); process.exit(1); });
