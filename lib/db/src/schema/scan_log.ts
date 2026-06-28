import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const scanLog = pgTable("scan_log", {
  id:           serial("id").primaryKey(),
  ticket_code:  text("ticket_code").notNull(),
  result:       text("result").notNull(),
  person_name:  text("person_name"),
  scanner_name: text("scanner_name"),
  scanned_at:   timestamp("scanned_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ScanLogEntry = typeof scanLog.$inferSelect;
