import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { buildAndSendDailyReport } from "./services/dailyReport.js";

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
