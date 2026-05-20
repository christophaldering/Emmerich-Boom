import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { anmeldungenTable } from "./anmeldungen";

export const anmeldungTicketsTable = pgTable("anmeldung_tickets", {
  id:             serial("id").primaryKey(),
  anmeldung_id:   integer("anmeldung_id").notNull().references(() => anmeldungenTable.id),
  person_name:    text("person_name").notNull(),
  ticket_nummer:  text("ticket_nummer").notNull().unique(),
  ticket_code:    text("ticket_code").notNull().unique(),
  versendet_am:    timestamp("versendet_am"),
  eingelassen_am:  timestamp("eingelassen_am"),
  created_at:      timestamp("created_at").defaultNow(),
});

export type AnmeldungTicket = typeof anmeldungTicketsTable.$inferSelect;
