import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "./envelope";

export async function requireApiAuth(): Promise<
  { userId: string; orgId: string; error: null } | { userId: null; orgId: null; error: ReturnType<typeof unauthorized> }
> {
  const session = await auth();
  const userId = session.userId;
  const orgId = session.orgId;

  if (!userId || !orgId) {
    return { userId: null, orgId: null, error: unauthorized() };
  }

  return { userId, orgId, error: null };
}
