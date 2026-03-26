import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @clerk/nextjs/server
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAuth, requireRole, requirePermission } from "../guards";

const mockAuth = vi.mocked(auth);
const mockRedirect = vi.mocked(redirect);

function mockSession(userId: string | null, role?: string) {
  mockAuth.mockResolvedValue({
    userId,
    sessionClaims: role ? { metadata: { role } } : {},
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session when user is authenticated", async () => {
    mockSession("user_123");
    const session = await requireAuth();
    expect(session.userId).toBe("user_123");
  });

  it("redirects to sign-in when not authenticated", async () => {
    mockSession(null);
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/sign-in");
    expect(mockRedirect).toHaveBeenCalledWith("/sign-in");
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows access when user has sufficient role level", async () => {
    mockSession("user_123", "admin");
    const result = await requireRole("partner");
    expect(result.role).toBe("admin");
  });

  it("allows access when user has exact role", async () => {
    mockSession("user_123", "associate");
    const result = await requireRole("associate");
    expect(result.role).toBe("associate");
  });

  it("redirects when user role is below required level", async () => {
    mockSession("user_123", "analyst");
    await expect(requireRole("partner")).rejects.toThrow("REDIRECT:/unauthorized");
  });

  it("redirects when user has no role metadata", async () => {
    mockSession("user_123");
    await expect(requireRole("analyst")).rejects.toThrow("REDIRECT:/unauthorized");
  });

  it("redirects unauthenticated users to sign-in", async () => {
    mockSession(null);
    await expect(requireRole("analyst")).rejects.toThrow("REDIRECT:/sign-in");
  });
});

describe("requirePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows access when user has the required permission", async () => {
    mockSession("user_123", "admin");
    const result = await requirePermission("manage_org");
    expect(result.role).toBe("admin");
  });

  it("redirects when user lacks the required permission", async () => {
    mockSession("user_123", "lp");
    await expect(requirePermission("create_deal")).rejects.toThrow(
      "REDIRECT:/unauthorized"
    );
  });

  it("LP can access view_reports", async () => {
    mockSession("user_123", "lp");
    const result = await requirePermission("view_reports");
    expect(result.role).toBe("lp");
  });

  it("analyst cannot access manage_org", async () => {
    mockSession("user_123", "analyst");
    await expect(requirePermission("manage_org")).rejects.toThrow(
      "REDIRECT:/unauthorized"
    );
  });

  it("redirects when user has no role", async () => {
    mockSession("user_123");
    await expect(requirePermission("view_deal")).rejects.toThrow(
      "REDIRECT:/unauthorized"
    );
  });
});
