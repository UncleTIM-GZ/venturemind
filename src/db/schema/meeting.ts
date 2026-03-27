import { pgTable, uuid, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { meetingTypeEnum } from "./enums";

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  type: meetingTypeEnum("type").default("other").notNull(),
  summary: text("summary"),
  actionItems: jsonb("action_items").default([]).notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
