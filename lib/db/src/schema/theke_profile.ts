import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { anmeldungTicketsTable } from "./anmeldung_tickets";

export const thekeProfileTable = pgTable("theke_profile", {
  id:                        serial("id").primaryKey(),
  anmeldung_ticket_id:       integer("anmeldung_ticket_id").notNull().unique().references(() => anmeldungTicketsTable.id),
  anzeige_name:              text("anzeige_name").notNull(),
  bestaetigt:                boolean("bestaetigt").notNull().default(false),
  vorstellung:               text("vorstellung"),
  jahr_1985:                 text("jahr_1985"),
  lauter_song:               text("lauter_song"),
  f_tontraeger:              text("f_tontraeger"),
  f_abends:                  text("f_abends"),
  f_untersatz:               text("f_untersatz"),
  f_musik:                   text("f_musik"),
  f_getraenk:                text("f_getraenk"),
  foto_frueher_key:          text("foto_frueher_key"),
  foto_frueher_jahr:         integer("foto_frueher_jahr"),
  foto_heute_key:            text("foto_heute_key"),
  foto_heute_jahr:           integer("foto_heute_jahr"),
  sichtbarkeit_zugestimmt_am: timestamp("sichtbarkeit_zugestimmt_am"),
  abendfotos_ok:             boolean("abendfotos_ok").notNull().default(false),
  tafel_ok:                  boolean("tafel_ok").notNull().default(false),
  tafel_zugestimmt_am:       timestamp("tafel_zugestimmt_am"),
  zuletzt_gesehen_am:        timestamp("zuletzt_gesehen_am"),
  created_at:                timestamp("created_at").defaultNow(),
  updated_at:                timestamp("updated_at").defaultNow(),
});

export const insertThekeProfileSchema = createInsertSchema(thekeProfileTable).omit({
  id: true, created_at: true, updated_at: true,
});
export type InsertThekeProfile = z.infer<typeof insertThekeProfileSchema>;
export type ThekeProfile = typeof thekeProfileTable.$inferSelect;
