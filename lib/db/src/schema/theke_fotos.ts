import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { anmeldungTicketsTable } from "./anmeldung_tickets";

export const thekeFotosTable = pgTable("theke_fotos", {
  id:                  serial("id").primaryKey(),
  anmeldung_ticket_id: integer("anmeldung_ticket_id").notNull().references(() => anmeldungTicketsTable.id),
  datei_key:           text("datei_key").notNull(),
  bildunterschrift:    text("bildunterschrift"),
  jahr:                integer("jahr"),
  sichtbar_ok:         boolean("sichtbar_ok").notNull().default(false),
  created_at:          timestamp("created_at").defaultNow(),
});

export const insertThekeFotoSchema = createInsertSchema(thekeFotosTable).omit({
  id: true, created_at: true,
});
export type InsertThekeFoto = z.infer<typeof insertThekeFotoSchema>;
export type ThekeFoto = typeof thekeFotosTable.$inferSelect;
