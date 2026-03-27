import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { requireApiAuth } from "../auth";

const mockAuth = vi.mocked(auth);

describe("requireApiAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns userId and orgId when authenticated", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_123",
      orgId: "org_456",
    } as any);

    const result = await requireApiAuth();
    expect(result.error).toBeNull();
    expect(result.userId).toBe("user_123");
    expect(result.orgId).toBe("org_456");
  });

  it("returns unauthorized error when no userId", async () => {
    mockAuth.mockResolvedValue({
      userId: null,
      orgId: null,
    } as any);

    const result = await requireApiAuth();
    expect(result.error).toBeDefined();
    expect(result.userId).toBeNull();
    expect(result.orgId).toBeNull();
  });

  it("returns unauthorized error when no orgId", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_123",
      orgId: null,
    } as any);

    const result = await requireApiAuth();
    expect(result.error).toBeDefined();
    expect(result.userId).toBeNull();
  });
});
