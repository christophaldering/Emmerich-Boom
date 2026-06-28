/**
 * Setzt alle 10 Demo-Tickets zurück:
 *   - eingelassen_am → NULL  (Ticket wieder scan-bereit)
 *   - Zugehörige scan_log-Einträge werden gelöscht
 *
 * Anlegen: pnpm --filter @workspace/scripts run demo-tickets-anlegen
 */
import { db, anmeldungTicketsTable, scanLog } from "@workspace/db";
import { inArray, isNotNull } from "drizzle-orm";

const CODES = Array.from({ length: 10 }, (_, i) =>
  `0DE${String(i + 1).padStart(13, "0")}`.toUpperCase()
);

async function run() {
  // scan_log-Einträge löschen
  const deletedLogs = await db
    .delete(scanLog)
    .where(inArray(scanLog.ticket_code, CODES))
    .returning({ id: scanLog.id });

  // eingelassen_am auf NULL setzen
  const reset = await db
    .update(anmeldungTicketsTable)
    .set({ eingelassen_am: null })
    .where(inArray(anmeldungTicketsTable.ticket_code, CODES))
    .returning({ ticket_code: anmeldungTicketsTable.ticket_code, person_name: anmeldungTicketsTable.person_name });

  if (reset.length === 0) {
    console.log("⚠  Keine Demo-Tickets gefunden — zuerst anlegen:");
    console.log("   pnpm --filter @workspace/scripts run demo-tickets-anlegen");
    process.exit(0);
  }

  console.log(`\n✓ ${reset.length} Demo-Tickets zurückgesetzt:`);
  for (const t of reset) {
    console.log(`  ${t.ticket_code}  ${t.person_name}`);
  }
  console.log(`\n✓ ${deletedLogs.length} scan_log-Einträge gelöscht.`);
  console.log("\nAlle Demo-Tickets können jetzt erneut gescannt werden.");
}

run().catch(e => { console.error(e); process.exit(1); });
