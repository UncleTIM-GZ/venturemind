import { describe, it, expect } from "vitest";
import { generateSeedData, SEED_COUNTS } from "../seed";

describe("Seed data generation", () => {
  const data = generateSeedData();

  it("generates correct number of organizations", () => {
    expect(data.organizations).toHaveLength(SEED_COUNTS.organizations);
  });

  it("generates correct number of funds", () => {
    expect(data.funds).toHaveLength(SEED_COUNTS.funds);
  });

  it("generates correct number of companies", () => {
    expect(data.companies).toHaveLength(SEED_COUNTS.companies);
  });

  it("generates correct number of deals", () => {
    expect(data.deals).toHaveLength(SEED_COUNTS.deals);
  });

  it("generates correct number of contacts", () => {
    expect(data.contacts).toHaveLength(SEED_COUNTS.contacts);
  });

  it("generates correct number of LPs", () => {
    expect(data.lps).toHaveLength(SEED_COUNTS.lps);
  });

  it("generates correct number of meetings", () => {
    expect(data.meetings).toHaveLength(SEED_COUNTS.meetings);
  });

  it("generates correct number of tasks", () => {
    expect(data.tasks).toHaveLength(SEED_COUNTS.tasks);
  });

  it("generates correct number of tags", () => {
    expect(data.tags).toHaveLength(SEED_COUNTS.tags);
  });

  it("generates correct number of audit logs", () => {
    expect(data.auditLogs).toHaveLength(SEED_COUNTS.auditLogs);
  });

  it("organizations have required fields", () => {
    for (const org of data.organizations) {
      expect(org.id).toBeDefined();
      expect(org.clerkOrgId).toBeDefined();
      expect(org.name).toBeTruthy();
      expect(org.slug).toBeTruthy();
      expect(["free", "pro", "enterprise"]).toContain(org.plan);
    }
  });

  it("funds reference valid org IDs", () => {
    const orgIds = new Set(data.organizations.map((o) => o.id));
    for (const fund of data.funds) {
      expect(orgIds.has(fund.orgId)).toBe(true);
    }
  });

  it("deals reference valid fund and company IDs", () => {
    const fundIds = new Set(data.funds.map((f) => f.id));
    const companyIds = new Set(data.companies.map((c) => c.id));
    for (const deal of data.deals) {
      expect(fundIds.has(deal.fundId)).toBe(true);
      expect(companyIds.has(deal.companyId)).toBe(true);
    }
  });

  it("contacts have valid email format", () => {
    for (const contact of data.contacts) {
      if (contact.email) {
        expect(contact.email).toMatch(/@/);
      }
    }
  });

  it("LPs have positive committed capital", () => {
    for (const lp of data.lps) {
      expect(lp.committedCapitalUsd).toBeGreaterThan(0);
    }
  });

  it("fund-LP commitments reference valid fund and LP IDs", () => {
    const fundIds = new Set(data.funds.map((f) => f.id));
    const lpIds = new Set(data.lps.map((l) => l.id));
    for (const fl of data.fundLps) {
      expect(fundIds.has(fl.fundId)).toBe(true);
      expect(lpIds.has(fl.lpId)).toBe(true);
    }
  });

  it("deal-tag associations reference valid deal and tag IDs", () => {
    const dealIds = new Set(data.deals.map((d) => d.id));
    const tagIds = new Set(data.tags.map((t) => t.id));
    for (const dt of data.dealTags) {
      expect(dealIds.has(dt.dealId)).toBe(true);
      expect(tagIds.has(dt.tagId)).toBe(true);
    }
  });

  it("all entities have unique IDs", () => {
    const allIds = [
      ...data.organizations.map((o) => o.id),
      ...data.funds.map((f) => f.id),
      ...data.companies.map((c) => c.id),
      ...data.deals.map((d) => d.id),
      ...data.contacts.map((c) => c.id),
      ...data.lps.map((l) => l.id),
      ...data.meetings.map((m) => m.id),
      ...data.tasks.map((t) => t.id),
      ...data.tags.map((t) => t.id),
      ...data.auditLogs.map((a) => a.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
