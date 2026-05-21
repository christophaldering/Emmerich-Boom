import { db } from "@workspace/db";
import { anmeldungTicketsTable, ticketNummerCounter } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

/**
 * Nummeriert alle Tickets in anmeldung_tickets sequenziell neu (1, 2, 3 …),
 * geordnet nach aufsteigender id. Setzt anschließend den ticket_nummer_counter
 * (id=2) auf den höchsten vergebenen Wert, damit neue Tickets nahtlos weiterlaufen.
 *
 * Ausführen: pnpm --filter @workspace/scripts run renumber-tickets
 */

async function main() {
  const tickets = await db
    .select({ id: anmeldungTicketsTable.id, person_name: anmeldungTicketsTable.person_name, ticket_nummer: anmeldungTicketsTable.ticket_nummer })
    .from(anmeldungTicketsTable)
    .orderBy(asc(anmeldungTicketsTable.id));

  if (tickets.length === 0) {
    console.log("Keine Tickets in der Datenbank — nichts zu tun.");
    process.exit(0);
  }

  console.log(`${tickets.length} Ticket(s) gefunden. Starte Umnummerierung…\n`);

  await db.transaction(async (tx) => {
    // Temporäres Unique-Constraint-Problem vermeiden: erst alle auf Hilfswerte setzen
    for (const t of tickets) {
      await tx
        .update(anmeldungTicketsTable)
        .set({ ticket_nummer: `__tmp_${t.id}` })
        .where(eq(anmeldungTicketsTable.id, t.id));
    }

    // Jetzt sequenziell neu vergeben
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i]!;
      const neueNummer = String(i + 1);
      console.log(
        `  #${String(i + 1).padStart(3, "0")}  ${t.person_name.padEnd(30)} ` +
        `alt: ${t.ticket_nummer.padEnd(15)} → neu: ${neueNummer}`,
      );
      await tx
        .update(anmeldungTicketsTable)
        .set({ ticket_nummer: neueNummer })
        .where(eq(anmeldungTicketsTable.id, t.id));
    }

    // Counter (id=2) auf höchsten vergebenen Wert setzen
    const neuerCounterWert = tickets.length + 1;
    await tx
      .update(ticketNummerCounter)
      .set({ next_nummer: neuerCounterWert })
      .where(eq(ticketNummerCounter.id, 2));

    console.log(`\nCounter (id=2) gesetzt auf: ${neuerCounterWert} (nächstes Ticket bekommt #${neuerCounterWert})`);
  });

  console.log("\n✓ Umnummerierung abgeschlossen.");
}

main().catch((err) => {
  console.error("Fehler:", err);
  process.exit(1);
});
