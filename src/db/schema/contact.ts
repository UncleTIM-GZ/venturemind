import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { contactTypeEnum } from "./enums";

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  type: contactTypeEnum("type").default("other").notNull(),
  title: varchar("title", { length: 200 }),
  bio: text("bio"),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  // pgvector embedding — added via custom migration
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("contacts_org_id_idx").on(table.orgId),
  index("contacts_email_idx").on(table.email),
]);
