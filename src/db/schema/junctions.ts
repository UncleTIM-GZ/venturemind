import { pgTable, uuid, varchar, bigint, timestamp, primaryKey, boolean } from "drizzle-orm/pg-core";
import { deals } from "./deal";
import { tags } from "./tag";
import { companies } from "./company";
import { contacts } from "./contact";
import { funds } from "./fund";
import { lps } from "./lp";
import { meetings } from "./meeting";

export const dealTags = pgTable("deal_tags", {
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.dealId, table.tagId] }),
]);

export const companyTags = pgTable("company_tags", {
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.companyId, table.tagId] }),
]);

export const contactCompanies = pgTable("contact_companies", {
  contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 100 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
}, (table) => [
  primaryKey({ columns: [table.contactId, table.companyId] }),
]);

export const fundLps = pgTable("fund_lps", {
  fundId: uuid("fund_id").notNull().references(() => funds.id, { onDelete: "cascade" }),
  lpId: uuid("lp_id").notNull().references(() => lps.id, { onDelete: "cascade" }),
  committedAmount: bigint("committed_amount", { mode: "number" }).notNull(),
  commitmentDate: timestamp("commitment_date", { withTimezone: true }),
}, (table) => [
  primaryKey({ columns: [table.fundId, table.lpId] }),
]);

export const meetingAttendees = pgTable("meeting_attendees", {
  meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.meetingId, table.contactId] }),
]);

export const dealContacts = pgTable("deal_contacts", {
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 100 }),
}, (table) => [
  primaryKey({ columns: [table.dealId, table.contactId] }),
]);
