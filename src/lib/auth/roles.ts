export const ROLES = {
  ADMIN: "admin",
  PARTNER: "partner",
  ASSOCIATE: "associate",
  ANALYST: "analyst",
  LP: "lp",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.ADMIN]: 5,
  [ROLES.PARTNER]: 4,
  [ROLES.ASSOCIATE]: 3,
  [ROLES.ANALYST]: 2,
  [ROLES.LP]: 1,
};

export type Permission =
  | "manage_org"
  | "create_deal"
  | "edit_deal"
  | "view_deal"
  | "ic_vote"
  | "view_reports"
  | "access_ai_chat"
  | "manage_lp"
  | "view_portfolio";

const PERMISSION_MATRIX: Record<Role, readonly Permission[]> = {
  [ROLES.ADMIN]: [
    "manage_org",
    "create_deal",
    "edit_deal",
    "view_deal",
    "ic_vote",
    "view_reports",
    "access_ai_chat",
    "manage_lp",
    "view_portfolio",
  ],
  [ROLES.PARTNER]: [
    "create_deal",
    "edit_deal",
    "view_deal",
    "ic_vote",
    "view_reports",
    "access_ai_chat",
    "view_portfolio",
  ],
  [ROLES.ASSOCIATE]: [
    "create_deal",
    "edit_deal",
    "view_deal",
    "view_reports",
    "access_ai_chat",
    "view_portfolio",
  ],
  [ROLES.ANALYST]: [
    "view_deal",
    "view_reports",
    "access_ai_chat",
    "view_portfolio",
  ],
  [ROLES.LP]: ["view_reports"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSION_MATRIX[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): readonly Permission[] {
  return PERMISSION_MATRIX[role] ?? [];
}
