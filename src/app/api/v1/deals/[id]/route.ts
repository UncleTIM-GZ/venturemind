import { db } from "@/db/client";
import { createDealRepository } from "@/lib/repositories/deal.repository";
import { updateDealSchema } from "@/db/schema/validations";
import { ok, notFound } from "@/lib/api/envelope";
import { parseBody } from "@/lib/api/validation";
import { requireApiAuth } from "@/lib/api/auth";

const repo = createDealRepository(db);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const deal = await repo.findById(auth.orgId, id);
  if (!deal) return notFound("Deal");
  return ok(deal);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = await parseBody(req, updateDealSchema);
  if (parsed.error) return parsed.error;

  const deal = await repo.update(auth.orgId, id, parsed.data);
  if (!deal) return notFound("Deal");
  return ok(deal);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const deleted = await repo.delete(auth.orgId, id);
  if (!deleted) return notFound("Deal");
  return ok({ deleted: true });
}
