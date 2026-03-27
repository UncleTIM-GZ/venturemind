import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { deals } from "./deal";
import { icDecisionEnum } from "./enums";

export const icDecisions = pgTable("ic_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  decision: icDecisionEnum("decision").default("pending").notNull(),
  conditions: jsonb("conditions").default([]).notNull(),
  notes: text("notes"),
  voteDeadline: timestamp("vote_deadline", { withTimezone: true }),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
