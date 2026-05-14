import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const anmeldungTicketsTable = pgTable("anmeldung_tickets", {
  id:             serial("id").primaryKey(),
  anmeldung_id:   integer("anmeldung_id").notNull(),
  person_name:    text("person_name").notNull(),
  ticket_nummer:  text("ticket_nummer").notNull(),
  ticket_code:    text("ticket_code").notNull(),
  versendet_am:   timestamp("versendet_am"),
  created_at:     timestamp("created_at").defaultNow(),
});

export type AnmeldungTicket = typeof anmeldungTicketsTable.$inferSelect;
