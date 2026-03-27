import { db } from "@/db/client";
import { createCompanyRepository } from "@/lib/repositories/company.repository";
import { updateCompanySchema } from "@/db/schema/validations";
import { ok, notFound } from "@/lib/api/envelope";
import { parseBody } from "@/lib/api/validation";
import { requireApiAuth } from "@/lib/api/auth";

const repo = createCompanyRepository(db);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const company = await repo.findById(auth.orgId, id);
  if (!company) return notFound("Company");
  return ok(company);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = await parseBody(req, updateCompanySchema);
  if (parsed.error) return parsed.error;

  const company = await repo.update(auth.orgId, id, parsed.data);
  if (!company) return notFound("Company");
  return ok(company);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const deleted = await repo.delete(auth.orgId, id);
  if (!deleted) return notFound("Company");
  return ok({ deleted: true });
}
