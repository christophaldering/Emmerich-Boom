import { pgTable, integer } from "drizzle-orm/pg-core";

export const ticketNummerCounter = pgTable("ticket_nummer_counter", {
  id:           integer("id").primaryKey(),
  next_nummer:  integer("next_nummer").notNull(),
});
