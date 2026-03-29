import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  type Permission,
  type Role,
  hasPermission,
  ROLE_HIERARCHY,
} from "./roles";

export async function requireAuth() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireRole(requiredRole: Role) {
  const session = await requireAuth();
  const userRole = (session.sessionClaims?.metadata as { role?: Role })?.role;

  if (!userRole) {
    redirect("/unauthorized");
  }

  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
    redirect("/unauthorized");
  }

  return { ...session, role: userRole };
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const userRole = (session.sessionClaims?.metadata as { role?: Role })?.role;

  if (!userRole || !hasPermission(userRole, permission)) {
    redirect("/unauthorized");
  }

  return { ...session, role: userRole };
}
