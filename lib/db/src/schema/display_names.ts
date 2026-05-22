import { pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const displayNamesTable = pgTable(
  'display_names',
  {
    id:             serial('id').primaryKey(),
    source_type:   text('source_type').notNull(),
    source_id:     text('source_id').notNull(),
    raw_name:      text('raw_name').notNull(),
    song:          text('song').notNull(),
    suggested_name: text('suggested_name').notNull(),
    approved_name:  text('approved_name'),
    status:        text('status').notNull().default('pending'),
    updated_at:    timestamp('updated_at').defaultNow(),
  },
  (t) => [unique('display_names_source_unique').on(t.source_type, t.source_id)],
);

export type DisplayName = typeof displayNamesTable.$inferSelect;
