import { describe, it, expect } from "vitest";
import { formatZodError, parseBody } from "../validation";
import { z, ZodError } from "zod";
import {
  createDealSchema,
  createCompanySchema,
  createContactSchema,
  createFundSchema,
  createTagSchema,
  updateDealSchema,
} from "@/db/schema/validations";

describe("formatZodError", () => {
  it("formats single error", () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({});
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain("name:");
      expect(formatted.length).toBeGreaterThan(0);
    }
  });

  it("formats multiple errors", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = schema.safeParse({});
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain("name:");
      expect(formatted).toContain("age:");
      expect(formatted).toContain(";");
    }
  });
});

describe("parseBody", () => {
  function makeRequest(body: unknown): Request {
    return new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("parses valid body", async () => {
    const schema = z.object({ name: z.string() });
    const result = await parseBody(makeRequest({ name: "Test" }), schema);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ name: "Test" });
  });

  it("returns error for invalid body", async () => {
    const schema = z.object({ name: z.string() });
    const result = await parseBody(makeRequest({ name: 123 }), schema);
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it("returns error for invalid JSON", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: "not json",
    });
    const schema = z.object({ name: z.string() });
    const result = await parseBody(req, schema);
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});

describe("Zod validation schemas", () => {
  describe("createDealSchema", () => {
    it("validates a valid deal", () => {
      const result = createDealSchema.safeParse({
        fundId: "550e8400-e29b-41d4-a716-446655440000",
        companyId: "660e8400-e29b-41d4-a716-446655440000",
        title: "Series A — Acme Labs",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const result = createDealSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID for fundId", () => {
      const result = createDealSchema.safeParse({
        fundId: "not-a-uuid",
        companyId: "660e8400-e29b-41d4-a716-446655440000",
        title: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional stage with valid value", () => {
      const result = createDealSchema.safeParse({
        fundId: "550e8400-e29b-41d4-a716-446655440000",
        companyId: "660e8400-e29b-41d4-a716-446655440000",
        title: "Test",
        stage: "screening",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid stage value", () => {
      const result = createDealSchema.safeParse({
        fundId: "550e8400-e29b-41d4-a716-446655440000",
        companyId: "660e8400-e29b-41d4-a716-446655440000",
        title: "Test",
        stage: "invalid_stage",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateDealSchema", () => {
    it("allows partial updates", () => {
      const result = updateDealSchema.safeParse({ title: "Updated Title" });
      expect(result.success).toBe(true);
    });

    it("allows empty object", () => {
      const result = updateDealSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("createCompanySchema", () => {
    it("validates a valid company", () => {
      const result = createCompanySchema.safeParse({ name: "Acme Labs" });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = createCompanySchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("validates website URL format", () => {
      const valid = createCompanySchema.safeParse({ name: "Test", website: "https://example.com" });
      expect(valid.success).toBe(true);

      const invalid = createCompanySchema.safeParse({ name: "Test", website: "not-a-url" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("createContactSchema", () => {
    it("validates a valid contact", () => {
      const result = createContactSchema.safeParse({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = createContactSchema.safeParse({
        firstName: "John",
        lastName: "Doe",
        email: "not-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createFundSchema", () => {
    it("validates a valid fund", () => {
      const result = createFundSchema.safeParse({
        name: "Fund I",
        vintageYear: 2025,
        targetSizeUsd: 50000000,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative target size", () => {
      const result = createFundSchema.safeParse({
        name: "Fund I",
        vintageYear: 2025,
        targetSizeUsd: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createTagSchema", () => {
    it("validates a valid tag", () => {
      const result = createTagSchema.safeParse({ name: "Fintech" });
      expect(result.success).toBe(true);
    });

    it("validates hex color format", () => {
      const valid = createTagSchema.safeParse({ name: "Test", color: "#FF5733" });
      expect(valid.success).toBe(true);

      const invalid = createTagSchema.safeParse({ name: "Test", color: "red" });
      expect(invalid.success).toBe(false);
    });
  });
});
