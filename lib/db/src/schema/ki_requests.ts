import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const kiRequests = pgTable('ki_requests', {
  id: serial('id').primaryKey(),
  ip: text('ip').notNull(),
  inhalt: text('inhalt').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
