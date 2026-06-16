import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { anmeldungTicketsTable } from "./anmeldung_tickets";

export const thekeBotschaftenTable = pgTable("theke_botschaften", {
  id:                  serial("id").primaryKey(),
  anmeldung_ticket_id: integer("anmeldung_ticket_id").notNull().references(() => anmeldungTicketsTable.id),
  datei_key:           text("datei_key").notNull(),
  dauer_sek:           integer("dauer_sek").notNull(),
  abspielen_ok:        boolean("abspielen_ok").notNull().default(false),
  created_at:          timestamp("created_at").defaultNow(),
});

export const insertThekeBotschaftSchema = createInsertSchema(thekeBotschaftenTable).omit({
  id: true, created_at: true,
});
export type InsertThekeBotschaft = z.infer<typeof insertThekeBotschaftSchema>;
export type ThekeBotschaft = typeof thekeBotschaftenTable.$inferSelect;
