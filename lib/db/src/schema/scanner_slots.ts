import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const scannerSlots = pgTable("scanner_slots", {
  id:         serial("id").primaryKey(),
  name:       text("name").notNull(),
  password:   text("password").notNull(),
  active:     boolean("active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ScannerSlot = typeof scannerSlots.$inferSelect;
