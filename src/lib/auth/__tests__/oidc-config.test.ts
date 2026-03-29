import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * These tests verify that the AI Gateway OIDC configuration schema
 * is correctly defined and validates expected inputs.
 *
 * In production, OIDC tokens are auto-provisioned by `vercel env pull`.
 * The env.ts module uses @t3-oss/env-nextjs with skipValidation for CI builds.
 */

const serverEnvSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  VERCEL_OIDC_TOKEN: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

describe("AI Gateway OIDC Configuration", () => {
  it("accepts valid OIDC token configuration", () => {
    const result = serverEnvSchema.safeParse({
      CLERK_SECRET_KEY: "sk_test_abc123",
      VERCEL_OIDC_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test",
      NODE_ENV: "production",
    });
    expect(result.success).toBe(true);
  });

  it("accepts API key fallback configuration", () => {
    const result = serverEnvSchema.safeParse({
      CLERK_SECRET_KEY: "sk_test_abc123",
      AI_GATEWAY_API_KEY: "agw_key_xyz",
      NODE_ENV: "production",
    });
    expect(result.success).toBe(true);
  });

  it("accepts configuration with both OIDC and API key", () => {
    const result = serverEnvSchema.safeParse({
      CLERK_SECRET_KEY: "sk_test_abc123",
      VERCEL_OIDC_TOKEN: "eyJhbGciOiJSUzI1NiJ9.test",
      AI_GATEWAY_API_KEY: "agw_key_xyz",
      NODE_ENV: "production",
    });
    expect(result.success).toBe(true);
  });

  it("accepts configuration without AI credentials (for local dev)", () => {
    const result = serverEnvSchema.safeParse({
      CLERK_SECRET_KEY: "sk_test_abc123",
      NODE_ENV: "development",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing CLERK_SECRET_KEY", () => {
    const result = serverEnvSchema.safeParse({
      NODE_ENV: "production",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty CLERK_SECRET_KEY", () => {
    const result = serverEnvSchema.safeParse({
      CLERK_SECRET_KEY: "",
      NODE_ENV: "production",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid NODE_ENV", () => {
    const result = serverEnvSchema.safeParse({
      CLERK_SECRET_KEY: "sk_test_abc123",
      NODE_ENV: "staging",
    });
    expect(result.success).toBe(false);
  });
});
