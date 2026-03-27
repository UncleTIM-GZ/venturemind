import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { orgPlanEnum } from "./enums";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  plan: orgPlanEnum("plan").default("free").notNull(),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
