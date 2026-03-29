import { pgTable, uuid, varchar, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { companies } from "./company";

export const companyMetrics = pgTable("company_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  value: numeric("value", { precision: 20, scale: 4 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("company_metrics_company_id_idx").on(table.companyId),
  index("company_metrics_period_idx").on(table.period),
]);
