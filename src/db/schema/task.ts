import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { deals } from "./deal";
import { taskStatusEnum, taskPriorityEnum } from "./enums";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assigneeId: varchar("assignee_id", { length: 255 }),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
