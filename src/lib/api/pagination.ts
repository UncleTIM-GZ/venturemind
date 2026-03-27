import type { PaginationMeta } from "./envelope";

export interface QueryOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function parseQueryParams(searchParams: URLSearchParams): QueryOptions {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const search = searchParams.get("search") ?? undefined;

  const filters: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^filter\[(\w+)\]$/);
    if (match) {
      filters[match[1]] = value;
    }
  }

  return { page, limit, sort, order, search, filters };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}
