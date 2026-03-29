import { describe, it, expect } from "vitest";
import type {
  OrganizationId,
  FundId,
  DealId,
  CompanyId,
  ContactId,
  LPId,
  InvestmentId,
  RoundId,
  InvestmentMemoId,
  CompanyMetricId,
  ReportId,
  MeetingId,
  TaskId,
  ICDecisionId,
  TagId,
  AuditLogId,
} from "../types";

describe("Branded ID types", () => {
  it("all branded ID types are defined and string-based", () => {
    // Branded types are compile-time only — we verify they accept strings at runtime
    const orgId = "org-123" as OrganizationId;
    const fundId = "fund-456" as FundId;
    const dealId = "deal-789" as DealId;
    const companyId = "company-abc" as CompanyId;
    const contactId = "contact-def" as ContactId;
    const lpId = "lp-ghi" as LPId;
    const investmentId = "inv-jkl" as InvestmentId;
    const roundId = "round-mno" as RoundId;
    const memoId = "memo-pqr" as InvestmentMemoId;
    const metricId = "metric-stu" as CompanyMetricId;
    const reportId = "report-vwx" as ReportId;
    const meetingId = "meeting-yza" as MeetingId;
    const taskId = "task-bcd" as TaskId;
    const icId = "ic-efg" as ICDecisionId;
    const tagId = "tag-hij" as TagId;
    const auditId = "audit-klm" as AuditLogId;

    // All should be string-based at runtime
    expect(typeof orgId).toBe("string");
    expect(typeof fundId).toBe("string");
    expect(typeof dealId).toBe("string");
    expect(typeof companyId).toBe("string");
    expect(typeof contactId).toBe("string");
    expect(typeof lpId).toBe("string");
    expect(typeof investmentId).toBe("string");
    expect(typeof roundId).toBe("string");
    expect(typeof memoId).toBe("string");
    expect(typeof metricId).toBe("string");
    expect(typeof reportId).toBe("string");
    expect(typeof meetingId).toBe("string");
    expect(typeof taskId).toBe("string");
    expect(typeof icId).toBe("string");
    expect(typeof tagId).toBe("string");
    expect(typeof auditId).toBe("string");
  });

  it("branded IDs maintain their string value", () => {
    const dealId = "550e8400-e29b-41d4-a716-446655440000" as DealId;
    expect(dealId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(dealId.length).toBe(36);
  });
});
