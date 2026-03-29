import { describe, it, expect } from "vitest";
import * as schema from "../schema";

describe("Schema definitions", () => {
  it("exports all 16 entity tables", () => {
    expect(schema.organizations).toBeDefined();
    expect(schema.funds).toBeDefined();
    expect(schema.companies).toBeDefined();
    expect(schema.deals).toBeDefined();
    expect(schema.rounds).toBeDefined();
    expect(schema.investments).toBeDefined();
    expect(schema.contacts).toBeDefined();
    expect(schema.lps).toBeDefined();
    expect(schema.investmentMemos).toBeDefined();
    expect(schema.companyMetrics).toBeDefined();
    expect(schema.reports).toBeDefined();
    expect(schema.meetings).toBeDefined();
    expect(schema.tasks).toBeDefined();
    expect(schema.icDecisions).toBeDefined();
    expect(schema.tags).toBeDefined();
    expect(schema.auditLogs).toBeDefined();
  });

  it("exports all 6 junction tables", () => {
    expect(schema.dealTags).toBeDefined();
    expect(schema.companyTags).toBeDefined();
    expect(schema.contactCompanies).toBeDefined();
    expect(schema.fundLps).toBeDefined();
    expect(schema.meetingAttendees).toBeDefined();
    expect(schema.dealContacts).toBeDefined();
  });

  it("exports all enum types", () => {
    expect(schema.orgPlanEnum).toBeDefined();
    expect(schema.fundStatusEnum).toBeDefined();
    expect(schema.companyStageEnum).toBeDefined();
    expect(schema.dealStageEnum).toBeDefined();
    expect(schema.dealPriorityEnum).toBeDefined();
    expect(schema.roundTypeEnum).toBeDefined();
    expect(schema.roundStatusEnum).toBeDefined();
    expect(schema.instrumentEnum).toBeDefined();
    expect(schema.contactTypeEnum).toBeDefined();
    expect(schema.lpTypeEnum).toBeDefined();
    expect(schema.memoStatusEnum).toBeDefined();
    expect(schema.reportTypeEnum).toBeDefined();
    expect(schema.reportStatusEnum).toBeDefined();
    expect(schema.meetingTypeEnum).toBeDefined();
    expect(schema.taskStatusEnum).toBeDefined();
    expect(schema.taskPriorityEnum).toBeDefined();
    expect(schema.icDecisionEnum).toBeDefined();
    expect(schema.auditActionEnum).toBeDefined();
  });

  describe("enum values", () => {
    it("orgPlanEnum has correct values", () => {
      expect(schema.orgPlanEnum.enumValues).toEqual(["free", "pro", "enterprise"]);
    });

    it("dealStageEnum has 8 stages", () => {
      expect(schema.dealStageEnum.enumValues).toHaveLength(8);
      expect(schema.dealStageEnum.enumValues).toContain("sourced");
      expect(schema.dealStageEnum.enumValues).toContain("closed_won");
      expect(schema.dealStageEnum.enumValues).toContain("passed");
    });

    it("instrumentEnum covers all types", () => {
      expect(schema.instrumentEnum.enumValues).toEqual([
        "equity", "safe", "convertible_note", "warrant",
      ]);
    });

    it("contactTypeEnum includes founder and lp", () => {
      expect(schema.contactTypeEnum.enumValues).toContain("founder");
      expect(schema.contactTypeEnum.enumValues).toContain("lp");
    });

    it("companyStageEnum ordered from pre_seed to public", () => {
      const stages = schema.companyStageEnum.enumValues;
      expect(stages[0]).toBe("pre_seed");
      expect(stages[stages.length - 1]).toBe("public");
    });
  });
});
