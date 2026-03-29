import { pgTable, uuid, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { auditActionEnum } from "./enums";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  actorId: varchar("actor_id", { length: 255 }).notNull(),
  action: auditActionEnum("action").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  changes: jsonb("changes").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("audit_logs_org_id_idx").on(table.orgId),
  index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  index("audit_logs_created_at_idx").on(table.createdAt),
]);
