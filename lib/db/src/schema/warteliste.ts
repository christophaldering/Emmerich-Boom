import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wartelisteTable = pgTable("warteliste", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  bestaetigung_versendet_am: timestamp("bestaetigung_versendet_am"),
});

export const insertWartelisteSchema = createInsertSchema(wartelisteTable).omit({
  id: true,
  created_at: true,
  bestaetigung_versendet_am: true,
});
export type InsertWarteliste = z.infer<typeof insertWartelisteSchema>;
export type Warteliste = typeof wartelisteTable.$inferSelect;
