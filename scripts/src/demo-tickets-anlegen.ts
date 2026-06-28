/**
 * Legt 10 Demo-Tickets an (idempotent — existierende werden übersprungen).
 * Ticket-Codes: 0DE0000000000001 … 0DE000000000000A  (alle gültige 16-stellige Hex)
 * Ticket-Nummern: DEMO-01 … DEMO-10
 * Reset: pnpm --filter @workspace/scripts run demo-tickets-reset
 */
import { db, anmeldungenTable, anmeldungTicketsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";

const DEMO_PERSONEN = [
  "Anna Bergmann",
  "Klaus Hoffmann",
  "Monika Schmidt",
  "Werner Schulte",
  "Ingrid Fischer",
  "Günter Bauer",
  "Hildegard Meyer",
  "Dieter Wagner",
  "Ursula Koch",
  "Helmut Schäfer",
];

const CODES = DEMO_PERSONEN.map((_, i) =>
  `0DE${String(i + 1).padStart(13, "0")}`.toUpperCase()
);

async function run() {
  // Bereits vorhandene Demo-Tickets prüfen
  const existing = await db
    .select({ ticket_code: anmeldungTicketsTable.ticket_code })
    .from(anmeldungTicketsTable)
    .where(inArray(anmeldungTicketsTable.ticket_code, CODES));

  const existingCodes = new Set(existing.map(r => r.ticket_code));

  let angelegt = 0;
  let uebersprungen = 0;

  for (let i = 0; i < DEMO_PERSONEN.length; i++) {
    const name   = DEMO_PERSONEN[i]!;
    const code   = CODES[i]!;
    const nummer = `DEMO-${String(i + 1).padStart(2, "0")}`;

    if (existingCodes.has(code)) {
      console.log(`  ↷ ${nummer}  ${name}  — bereits vorhanden`);
      uebersprungen++;
      continue;
    }

    const [anmeldung] = await db
      .insert(anmeldungenTable)
      .values({
        email:           `demo${i + 1}@emmerich-boomt.de`,
        telefon:         null,
        personen_anzahl: 1,
        personen:        [{ name }],
        bezahlweg:       "freiticket",
        song:            null,
        statement:       "Demo-Ticket (Testbetrieb)",
        betrag_gesamt:   0,
        ticket_nummern:  [nummer],
        bezahlt_am:      new Date(),
      })
      .returning();

    if (!anmeldung) throw new Error(`Anmeldung für ${name} fehlgeschlagen`);

    await db.insert(anmeldungTicketsTable).values({
      anmeldung_id:  anmeldung.id,
      person_name:   name,
      ticket_nummer: nummer,
      ticket_code:   code,
    });

    console.log(`  ✓ ${nummer}  ${name}  →  Code: ${code}`);
    angelegt++;
  }

  console.log(`\nFertig: ${angelegt} angelegt, ${uebersprungen} übersprungen.`);
  console.log("\nScanner-Test-URLs:");
  for (let i = 0; i < DEMO_PERSONEN.length; i++) {
    console.log(`  https://emmerich-boomt.de/boomer-orga-intern/ticket/${CODES[i]}`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
