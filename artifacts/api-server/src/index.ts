import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { buildAndSendDailyReport } from "./services/dailyReport.js";
import { db, anmeldungenTable, anmeldungTicketsTable, thekeProfileTable, thekeFotosTable, thekeBotschaftenTable } from "@workspace/db";
import { kiRequests } from "@workspace/db";
import { count, eq } from "drizzle-orm";
import { SERVER_CONFIG } from "./config.js";

async function seedKaiIfEmpty() {
  try {
    const [{ value }] = await db.select({ value: count() }).from(kiRequests);
    if (value > 0) return;
    await db.insert(kiRequests).values({
      ip: "seed",
      inhalt: `Ich habe bisher zwei Anmeldungen gelesen. Aldi kommt allein und hat das Programm bereits: alte Bekannte, neue Bekannte, geile Mucke, abrocken. Phil Collins \u2014 In the Air Tonight. KaI registriert: wer diesen Song w\u00e4hlt, wei\u00df genau, auf welchen Moment er wartet. Lucia hat es k\u00fcrzer gehalten: \u201eBin dabei\u201c und Gloria Gaynor \u2014 I Will Survive. KaI braucht keine weiteren Informationen.`,
    });
    logger.info("[KaI] Seed-Kommentar eingefügt");
  } catch (err) {
    logger.error({ err }, "[KaI] Seed fehlgeschlagen");
  }
}

async function seedThekeDemoIfMissing() {
  try {
    // ── Einmalige Bereinigung: altes kleingeschriebenes Demo-Ticket entfernen ──
    const OLD_CODE = "00000000deadbeef";
    const [oldTicket] = await db
      .select({ id: anmeldungTicketsTable.id, anmeldung_id: anmeldungTicketsTable.anmeldung_id })
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.ticket_code, OLD_CODE))
      .limit(1);
    if (oldTicket) {
      await db.delete(thekeBotschaftenTable).where(eq(thekeBotschaftenTable.anmeldung_ticket_id, oldTicket.id));
      await db.delete(thekeFotosTable).where(eq(thekeFotosTable.anmeldung_ticket_id, oldTicket.id));
      await db.delete(thekeProfileTable).where(eq(thekeProfileTable.anmeldung_ticket_id, oldTicket.id));
      await db.delete(anmeldungTicketsTable).where(eq(anmeldungTicketsTable.id, oldTicket.id));
      // Zugehörige Demo-Bestellung löschen, wenn keine anderen Tickets mehr hängen
      const remaining = await db
        .select({ id: anmeldungTicketsTable.id })
        .from(anmeldungTicketsTable)
        .where(eq(anmeldungTicketsTable.anmeldung_id, oldTicket.anmeldung_id))
        .limit(1);
      if (remaining.length === 0) {
        await db.delete(anmeldungenTable).where(eq(anmeldungenTable.id, oldTicket.anmeldung_id));
      }
      logger.info("[Theke] Altes Klein-Demo-Ticket bereinigt");
    }

    // ── Großgeschriebenes Demo-Ticket anlegen falls noch nicht vorhanden ──
    const existing = await db
      .select({ id: anmeldungTicketsTable.id })
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.ticket_code, SERVER_CONFIG.THEKE_DEMO_CODE))
      .limit(1);
    if (existing.length > 0) return;

    const [demo] = await db
      .insert(anmeldungenTable)
      .values({
        email:         "orga-vorschau@emmerich-boomt.de",
        personen_anzahl: 1,
        personen:      ["Orga-Vorschau"],
        betrag_gesamt: 0,
        bezahlweg:     "demo",
        song:          "Demo",
        statement:     "Orga-Vorschau-Zugang — kein echter Teilnehmer",
      })
      .returning({ id: anmeldungenTable.id });

    if (!demo) throw new Error("Demo-Anmeldung konnte nicht angelegt werden");

    await db.insert(anmeldungTicketsTable).values({
      anmeldung_id: demo.id,
      person_name:  "Orga-Vorschau",
      ticket_nummer: "DEMO-0000",
      ticket_code:  SERVER_CONFIG.THEKE_DEMO_CODE,
    });

    logger.info("[Theke] Demo-Ticket angelegt (idempotent)");
  } catch (err) {
    logger.error({ err }, "[Theke] Demo-Seed fehlgeschlagen — Serverstart nicht blockiert");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  seedKaiIfEmpty();
  seedThekeDemoIfMissing();

  cron.schedule(
    "0 8 * * *",
    () => {
      logger.info("[Cron] Starte täglichen Bericht ...");
      buildAndSendDailyReport().catch(e =>
        logger.error({ err: e }, "[Cron] Tagesbericht fehlgeschlagen"),
      );
    },
    { timezone: "Europe/Berlin" },
  );

  logger.info("[Cron] Tagesbericht täglich 08:00 Uhr (Europe/Berlin) geplant");
});
