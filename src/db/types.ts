/** Branded ID types for type safety — prevents mixing entity IDs */

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type OrganizationId = Brand<string, "OrganizationId">;
export type FundId = Brand<string, "FundId">;
export type CompanyId = Brand<string, "CompanyId">;
export type DealId = Brand<string, "DealId">;
export type RoundId = Brand<string, "RoundId">;
export type InvestmentId = Brand<string, "InvestmentId">;
export type ContactId = Brand<string, "ContactId">;
export type LPId = Brand<string, "LPId">;
export type InvestmentMemoId = Brand<string, "InvestmentMemoId">;
export type CompanyMetricId = Brand<string, "CompanyMetricId">;
export type ReportId = Brand<string, "ReportId">;
export type MeetingId = Brand<string, "MeetingId">;
export type TaskId = Brand<string, "TaskId">;
export type ICDecisionId = Brand<string, "ICDecisionId">;
export type TagId = Brand<string, "TagId">;
export type AuditLogId = Brand<string, "AuditLogId">;
