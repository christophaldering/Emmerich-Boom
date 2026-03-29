import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { interessenten } from './interessenten';

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  anmeldungId: integer('anmeldung_id').references(() => interessenten.id),
  personName: text('person_name').notNull(),
  ticketCode: text('ticket_code').notNull().unique(),
  paymentMethod: text('payment_method'), // 'paypal' | 'ueberweisung' | 'bar'
  paidAt: timestamp('paid_at'),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
