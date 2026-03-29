import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { deals } from "./deal";
import { memoStatusEnum } from "./enums";

export const investmentMemos = pgTable("investment_memos", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: memoStatusEnum("status").default("draft").notNull(),
  content: jsonb("content").default({}).notNull(),
  templateId: varchar("template_id", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
