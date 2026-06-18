import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wartelisteTable = pgTable("warteliste", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  anzahl_karten: integer("anzahl_karten"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  bestaetigung_versendet_am: timestamp("bestaetigung_versendet_am"),
  nachruecker_token: text("nachruecker_token").unique(),
  nachruecker_eingeladen_am: timestamp("nachruecker_eingeladen_am"),
  nachruecker_status: text("nachruecker_status"),
});

export const insertWartelisteSchema = createInsertSchema(wartelisteTable).omit({
  id: true,
  created_at: true,
  bestaetigung_versendet_am: true,
  nachruecker_token: true,
  nachruecker_eingeladen_am: true,
  nachruecker_status: true,
});
export type InsertWarteliste = z.infer<typeof insertWartelisteSchema>;
export type Warteliste = typeof wartelisteTable.$inferSelect;
