import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { companyStageEnum } from "./enums";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  stage: companyStageEnum("stage"),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  // pgvector embedding — added via custom migration since Drizzle's vector support varies
  // embedding: vector("embedding", { dimensions: 1536 }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("companies_org_id_idx").on(table.orgId),
  index("companies_name_idx").on(table.name),
]);
