import { describe, it, expect } from "vitest";
import {
  ROLES,
  ROLE_HIERARCHY,
  hasPermission,
  getPermissions,
  type Role,
  type Permission,
} from "../roles";

describe("ROLES", () => {
  it("defines all five roles", () => {
    expect(Object.keys(ROLES)).toHaveLength(5);
    expect(ROLES.ADMIN).toBe("admin");
    expect(ROLES.PARTNER).toBe("partner");
    expect(ROLES.ASSOCIATE).toBe("associate");
    expect(ROLES.ANALYST).toBe("analyst");
    expect(ROLES.LP).toBe("lp");
  });
});

describe("ROLE_HIERARCHY", () => {
  it("admin has highest level", () => {
    expect(ROLE_HIERARCHY[ROLES.ADMIN]).toBe(5);
  });

  it("lp has lowest level", () => {
    expect(ROLE_HIERARCHY[ROLES.LP]).toBe(1);
  });

  it("hierarchy is strictly ordered", () => {
    expect(ROLE_HIERARCHY[ROLES.ADMIN]).toBeGreaterThan(ROLE_HIERARCHY[ROLES.PARTNER]);
    expect(ROLE_HIERARCHY[ROLES.PARTNER]).toBeGreaterThan(ROLE_HIERARCHY[ROLES.ASSOCIATE]);
    expect(ROLE_HIERARCHY[ROLES.ASSOCIATE]).toBeGreaterThan(ROLE_HIERARCHY[ROLES.ANALYST]);
    expect(ROLE_HIERARCHY[ROLES.ANALYST]).toBeGreaterThan(ROLE_HIERARCHY[ROLES.LP]);
  });
});

describe("hasPermission", () => {
  it("admin has all permissions", () => {
    const allPermissions: Permission[] = [
      "manage_org",
      "create_deal",
      "edit_deal",
      "view_deal",
      "ic_vote",
      "view_reports",
      "access_ai_chat",
      "manage_lp",
      "view_portfolio",
    ];
    for (const perm of allPermissions) {
      expect(hasPermission(ROLES.ADMIN, perm)).toBe(true);
    }
  });

  it("partner can vote in IC but cannot manage org", () => {
    expect(hasPermission(ROLES.PARTNER, "ic_vote")).toBe(true);
    expect(hasPermission(ROLES.PARTNER, "manage_org")).toBe(false);
  });

  it("associate can create deals but cannot vote in IC", () => {
    expect(hasPermission(ROLES.ASSOCIATE, "create_deal")).toBe(true);
    expect(hasPermission(ROLES.ASSOCIATE, "ic_vote")).toBe(false);
  });

  it("analyst can view deals but cannot create them", () => {
    expect(hasPermission(ROLES.ANALYST, "view_deal")).toBe(true);
    expect(hasPermission(ROLES.ANALYST, "create_deal")).toBe(false);
  });

  it("LP can only view reports", () => {
    expect(hasPermission(ROLES.LP, "view_reports")).toBe(true);
    expect(hasPermission(ROLES.LP, "view_deal")).toBe(false);
    expect(hasPermission(ROLES.LP, "access_ai_chat")).toBe(false);
    expect(hasPermission(ROLES.LP, "manage_org")).toBe(false);
  });

  it("returns false for unknown role", () => {
    expect(hasPermission("unknown" as Role, "view_deal")).toBe(false);
  });
});

describe("getPermissions", () => {
  it("admin has 9 permissions", () => {
    expect(getPermissions(ROLES.ADMIN)).toHaveLength(9);
  });

  it("LP has 1 permission", () => {
    expect(getPermissions(ROLES.LP)).toHaveLength(1);
    expect(getPermissions(ROLES.LP)).toContain("view_reports");
  });

  it("returns empty array for unknown role", () => {
    expect(getPermissions("unknown" as Role)).toEqual([]);
  });

  it("permissions decrease as role level decreases", () => {
    const adminPerms = getPermissions(ROLES.ADMIN).length;
    const partnerPerms = getPermissions(ROLES.PARTNER).length;
    const associatePerms = getPermissions(ROLES.ASSOCIATE).length;
    const analystPerms = getPermissions(ROLES.ANALYST).length;
    const lpPerms = getPermissions(ROLES.LP).length;

    expect(adminPerms).toBeGreaterThan(partnerPerms);
    expect(partnerPerms).toBeGreaterThanOrEqual(associatePerms);
    expect(associatePerms).toBeGreaterThan(analystPerms);
    expect(analystPerms).toBeGreaterThan(lpPerms);
  });
});
