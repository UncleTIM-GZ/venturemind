import { db } from "@/db/client";
import { createFundRepository } from "@/lib/repositories/fund.repository";
import { updateFundSchema } from "@/db/schema/validations";
import { ok, notFound } from "@/lib/api/envelope";
import { parseBody } from "@/lib/api/validation";
import { requireApiAuth } from "@/lib/api/auth";

const repo = createFundRepository(db);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const fund = await repo.findById(auth.orgId, id);
  if (!fund) return notFound("Fund");
  return ok(fund);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = await parseBody(req, updateFundSchema);
  if (parsed.error) return parsed.error;

  const fund = await repo.update(auth.orgId, id, parsed.data);
  if (!fund) return notFound("Fund");
  return ok(fund);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const deleted = await repo.delete(auth.orgId, id);
  if (!deleted) return notFound("Fund");
  return ok({ deleted: true });
}
