import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  visitorId: varchar("visitor_id", { length: 64 }),
  ip: varchar("ip", { length: 64 }),
  userAgent: varchar("user_agent", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  pingCount: integer("ping_count").default(1),
});
