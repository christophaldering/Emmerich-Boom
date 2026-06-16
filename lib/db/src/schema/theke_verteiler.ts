import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { anmeldungTicketsTable } from "./anmeldung_tickets";

export const thekeVerteilerTable = pgTable("theke_verteiler", {
  id:                  serial("id").primaryKey(),
  email:               text("email").notNull(),
  name:                text("name"),
  anmeldung_ticket_id: integer("anmeldung_ticket_id").references(() => anmeldungTicketsTable.id),
  einwilligung_am:     timestamp("einwilligung_am").notNull(),
  abgemeldet_am:       timestamp("abgemeldet_am"),
  created_at:          timestamp("created_at").defaultNow(),
}, (t) => [unique().on(t.email)]);

export const insertThekeVerteilerSchema = createInsertSchema(thekeVerteilerTable).omit({
  id: true, created_at: true,
});
export type InsertThekeVerteiler = z.infer<typeof insertThekeVerteilerSchema>;
export type ThekeVerteiler = typeof thekeVerteilerTable.$inferSelect;
