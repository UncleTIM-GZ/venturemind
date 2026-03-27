import { NextResponse } from "next/server";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: string; code: string };

export function ok<T>(data: T, meta?: PaginationMeta): NextResponse<ApiResponse<T>> {
  const body: ApiResponse<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };
  return NextResponse.json(body);
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data } as ApiResponse<T>, { status: 201 });
}

export function error(
  message: string,
  code: string,
  status: number = 400,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: message, code } as ApiResponse<never>,
    { status },
  );
}

export function unauthorized(): NextResponse<ApiResponse<never>> {
  return error("Unauthorized", "UNAUTHORIZED", 401);
}

export function notFound(entity: string): NextResponse<ApiResponse<never>> {
  return error(`${entity} not found`, "NOT_FOUND", 404);
}

export function validationError(message: string): NextResponse<ApiResponse<never>> {
  return error(message, "VALIDATION_ERROR", 400);
}
