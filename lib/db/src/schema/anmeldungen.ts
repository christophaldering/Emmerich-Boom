import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const anmeldungenTable = pgTable("anmeldungen", {
  id:                   serial("id").primaryKey(),
  email:                text("email").notNull(),
  telefon:              text("telefon"),
  personen_anzahl:      integer("personen_anzahl").notNull(),
  personen:             jsonb("personen").notNull().default([]),
  bezahlweg:            text("bezahlweg").notNull(),
  song:                 text("song"),
  statement:            text("statement"),
  betrag_gesamt:        integer("betrag_gesamt").notNull(),
  ticket_nummern:       jsonb("ticket_nummern").notNull().default([]),
  bezahlt_am:           timestamp("bezahlt_am"),
  ticket_versendet_am:  timestamp("ticket_versendet_am"),
  created_at:           timestamp("created_at").defaultNow(),
});

export const insertAnmeldungSchema = createInsertSchema(anmeldungenTable).omit({ id: true, created_at: true });
export type InsertAnmeldung = z.infer<typeof insertAnmeldungSchema>;
export type Anmeldung = typeof anmeldungenTable.$inferSelect;
