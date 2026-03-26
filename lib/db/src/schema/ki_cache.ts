import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const kiCache = pgTable('ki_cache', {
  id: serial('id').primaryKey(),
  inhalt: text('inhalt').notNull(),
  eintraegeCount: integer('eintraege_count').notNull().default(0),
  generiertAt: timestamp('generiert_at').defaultNow(),
});
