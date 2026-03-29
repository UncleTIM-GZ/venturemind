import { pgTable, uuid, varchar, integer, bigint, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { fundStatusEnum } from "./enums";

export const funds = pgTable("funds", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  vintageYear: integer("vintage_year").notNull(),
  targetSizeUsd: bigint("target_size_usd", { mode: "number" }).notNull(),
  status: fundStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
