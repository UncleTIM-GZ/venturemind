import { db } from "@/db/client";
import { createContactRepository } from "@/lib/repositories/contact.repository";
import { updateContactSchema } from "@/db/schema/validations";
import { ok, notFound } from "@/lib/api/envelope";
import { parseBody } from "@/lib/api/validation";
import { requireApiAuth } from "@/lib/api/auth";

const repo = createContactRepository(db);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const contact = await repo.findById(auth.orgId, id);
  if (!contact) return notFound("Contact");
  return ok(contact);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = await parseBody(req, updateContactSchema);
  if (parsed.error) return parsed.error;

  const contact = await repo.update(auth.orgId, id, parsed.data);
  if (!contact) return notFound("Contact");
  return ok(contact);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const deleted = await repo.delete(auth.orgId, id);
  if (!deleted) return notFound("Contact");
  return ok({ deleted: true });
}
