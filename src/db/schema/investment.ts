import { pgTable, uuid, bigint, numeric, timestamp } from "drizzle-orm/pg-core";
import { funds } from "./fund";
import { deals } from "./deal";
import { companies } from "./company";
import { instrumentEnum } from "./enums";

export const investments = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").notNull().references(() => funds.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  amountUsd: bigint("amount_usd", { mode: "number" }).notNull(),
  ownershipPercentage: numeric("ownership_percentage", { precision: 5, scale: 2 }),
  instrument: instrumentEnum("instrument").notNull(),
  investedAt: timestamp("invested_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
