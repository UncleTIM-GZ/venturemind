import { pgTable, uuid, varchar, bigint, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { contacts } from "./contact";
import { lpTypeEnum } from "./enums";

export const lps = pgTable("lps", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: lpTypeEnum("type").notNull(),
  committedCapitalUsd: bigint("committed_capital_usd", { mode: "number" }).default(0).notNull(),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
