import { pgTable, uuid, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { funds } from "./fund";
import { companies } from "./company";
import { dealStageEnum, dealPriorityEnum } from "./enums";

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  fundId: uuid("fund_id").notNull().references(() => funds.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  stage: dealStageEnum("stage").default("sourced").notNull(),
  priority: dealPriorityEnum("priority").default("medium").notNull(),
  source: varchar("source", { length: 100 }),
  aiScore: jsonb("ai_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("deals_org_id_idx").on(table.orgId),
  index("deals_fund_id_idx").on(table.fundId),
  index("deals_stage_idx").on(table.stage),
]);
