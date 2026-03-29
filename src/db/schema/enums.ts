import { pgEnum } from "drizzle-orm/pg-core";

export const orgPlanEnum = pgEnum("org_plan", [
  "free",
  "pro",
  "enterprise",
]);

export const fundStatusEnum = pgEnum("fund_status", [
  "raising",
  "active",
  "fully_deployed",
  "harvesting",
  "closed",
]);

export const companyStageEnum = pgEnum("company_stage", [
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "series_d",
  "growth",
  "pre_ipo",
  "public",
]);

export const dealStageEnum = pgEnum("deal_stage", [
  "sourced",
  "screening",
  "due_diligence",
  "ic_review",
  "term_sheet",
  "closed_won",
  "closed_lost",
  "passed",
]);

export const dealPriorityEnum = pgEnum("deal_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const roundTypeEnum = pgEnum("round_type", [
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "series_d",
  "growth",
  "bridge",
  "safe",
]);

export const roundStatusEnum = pgEnum("round_status", [
  "open",
  "closed",
  "cancelled",
]);

export const instrumentEnum = pgEnum("instrument", [
  "equity",
  "safe",
  "convertible_note",
  "warrant",
]);

export const contactTypeEnum = pgEnum("contact_type", [
  "founder",
  "executive",
  "investor",
  "advisor",
  "lp",
  "other",
]);

export const lpTypeEnum = pgEnum("lp_type", [
  "individual",
  "family_office",
  "institution",
  "fund_of_funds",
  "endowment",
  "pension",
  "other",
]);

export const memoStatusEnum = pgEnum("memo_status", [
  "draft",
  "in_review",
  "approved",
  "published",
  "archived",
]);

export const reportTypeEnum = pgEnum("report_type", [
  "quarterly",
  "annual",
  "capital_call",
  "distribution",
  "ad_hoc",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "in_review",
  "approved",
  "published",
]);

export const meetingTypeEnum = pgEnum("meeting_type", [
  "pitch",
  "follow_up",
  "board",
  "ic",
  "internal",
  "lp_update",
  "other",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const icDecisionEnum = pgEnum("ic_decision", [
  "invest",
  "pass",
  "more_dd",
  "table",
  "pending",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "view",
  "export",
  "login",
  "logout",
]);
