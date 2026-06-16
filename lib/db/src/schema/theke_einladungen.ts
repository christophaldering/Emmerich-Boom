import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { anmeldungenTable } from "./anmeldungen";

export const thekeEinladungenTable = pgTable("theke_einladungen", {
  id:               serial("id").primaryKey(),
  anmeldung_id:     integer("anmeldung_id").notNull().references(() => anmeldungenTable.id),
  empfaenger_email: text("empfaenger_email").notNull(),
  anzahl_tickets:   integer("anzahl_tickets").notNull(),
  ticket_codes:     jsonb("ticket_codes").notNull().default([]),
  typ:              text("typ").notNull(),
  status:           text("status").notNull(),
  fehler_text:      text("fehler_text"),
  versendet_am:     timestamp("versendet_am").notNull().defaultNow(),
  created_at:       timestamp("created_at").defaultNow(),
});

export const insertThekeEinladungSchema = createInsertSchema(thekeEinladungenTable).omit({
  id: true, created_at: true,
});
export type InsertThekeEinladung = z.infer<typeof insertThekeEinladungSchema>;
export type ThekeEinladung = typeof thekeEinladungenTable.$inferSelect;
