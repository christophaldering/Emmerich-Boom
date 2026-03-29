import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const interessenten = pgTable('interessenten', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  personen: text('personen').notNull().default('1'),
  statement: text('statement'),
  song: text('song'),
  visitorId: text('visitor_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
