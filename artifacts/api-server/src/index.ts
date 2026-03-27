import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { buildAndSendDailyReport } from "./services/dailyReport.js";
import { db } from "@workspace/db";
import { kiRequests } from "@workspace/db";
import { count } from "drizzle-orm";

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
