import { db } from "@/db/client";
import { createContactRepository } from "@/lib/repositories/contact.repository";
import { createContactSchema } from "@/db/schema/validations";
import { ok, created } from "@/lib/api/envelope";
import { parseQueryParams } from "@/lib/api/pagination";
import { parseBody } from "@/lib/api/validation";
import { requireApiAuth } from "@/lib/api/auth";

const repo = createContactRepository(db);

export async function GET(req: Request) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const opts = parseQueryParams(searchParams);
  const result = await repo.findAll(auth.orgId, opts);
  return ok(result.data, result.meta);
}

export async function POST(req: Request) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, createContactSchema);
  if (parsed.error) return parsed.error;

  const contact = await repo.create(auth.orgId, parsed.data);
  return created(contact);
}
