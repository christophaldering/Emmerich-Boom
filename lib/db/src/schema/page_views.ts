import { pgTable, serial, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),

  sessionId:  varchar("session_id",  { length: 64  }).notNull(),
  visitorId:  varchar("visitor_id",  { length: 64  }),

  ip:          varchar("ip",          { length: 64  }),
  userAgent:   varchar("user_agent",  { length: 512 }),
  referrer:    varchar("referrer",    { length: 512 }),
  entryPath:   varchar("entry_path",  { length: 512 }),

  lang:        varchar("lang",        { length: 16  }),
  timezone:    varchar("timezone",    { length: 64  }),

  screenWidth:   integer("screen_width"),
  screenHeight:  integer("screen_height"),
  viewportWidth:  integer("viewport_width"),
  viewportHeight: integer("viewport_height"),

  utmSource:   varchar("utm_source",   { length: 256 }),
  utmMedium:   varchar("utm_medium",   { length: 128 }),
  utmCampaign: varchar("utm_campaign", { length: 128 }),
  utmTerm:     varchar("utm_term",     { length: 128 }),
  utmContent:  varchar("utm_content",  { length: 128 }),

  os:             varchar("os",              { length: 64  }),
  browser:        varchar("browser",         { length: 64  }),
  scrollDepth:    integer("scroll_depth"),
  exitPath:       varchar("exit_path",       { length: 512 }),
  connectionType: varchar("connection_type", { length: 32  }),
  touchEnabled:   boolean("touch_enabled"),
  colorScheme:    varchar("color_scheme",    { length: 16  }),
  visitNumber:    integer("visit_number"),

  createdAt:   timestamp("created_at").defaultNow(),
  lastSeenAt:  timestamp("last_seen_at").defaultNow(),
  pingCount:   integer("ping_count").default(1),
});
