import { type ZodSchema, type ZodError } from "zod";
import { validationError } from "./envelope";

export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: ReturnType<typeof validationError> }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { data: null, error: validationError("Invalid JSON body") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { data: null, error: validationError(formatZodError(result.error)) };
  }

  return { data: result.data, error: null };
}
