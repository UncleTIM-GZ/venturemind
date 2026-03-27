import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
