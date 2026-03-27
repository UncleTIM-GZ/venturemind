import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { funds } from "./fund";
import { reportTypeEnum, reportStatusEnum } from "./enums";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  fundId: uuid("fund_id").notNull().references(() => funds.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: reportTypeEnum("type").notNull(),
  status: reportStatusEnum("status").default("draft").notNull(),
  content: jsonb("content").default({}).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
