import { pgTable, uuid, bigint, timestamp } from "drizzle-orm/pg-core";
import { companies } from "./company";
import { roundTypeEnum, roundStatusEnum } from "./enums";

export const rounds = pgTable("rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  roundType: roundTypeEnum("round_type").notNull(),
  preMoneyValuationUsd: bigint("pre_money_valuation_usd", { mode: "number" }),
  amountRaisedUsd: bigint("amount_raised_usd", { mode: "number" }),
  status: roundStatusEnum("status").default("open").notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
