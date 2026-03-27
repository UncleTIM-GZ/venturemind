import { describe, it, expect } from "vitest";
import { parseQueryParams, buildPaginationMeta } from "../pagination";

describe("parseQueryParams", () => {
  it("returns defaults when no params provided", () => {
    const params = new URLSearchParams();
    const result = parseQueryParams(params);
    expect(result).toEqual({
      page: 1,
      limit: 20,
      sort: "created_at",
      order: "desc",
      search: undefined,
      filters: {},
    });
  });

  it("parses page and limit", () => {
    const params = new URLSearchParams("page=3&limit=50");
    const result = parseQueryParams(params);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it("clamps limit to max 100", () => {
    const params = new URLSearchParams("limit=500");
    const result = parseQueryParams(params);
    expect(result.limit).toBe(100);
  });

  it("clamps limit to min 1", () => {
    const params = new URLSearchParams("limit=0");
    const result = parseQueryParams(params);
    expect(result.limit).toBe(1);
  });

  it("clamps page to min 1", () => {
    const params = new URLSearchParams("page=-5");
    const result = parseQueryParams(params);
    expect(result.page).toBe(1);
  });

  it("parses sort and order", () => {
    const params = new URLSearchParams("sort=name&order=asc");
    const result = parseQueryParams(params);
    expect(result.sort).toBe("name");
    expect(result.order).toBe("asc");
  });

  it("defaults order to desc for invalid values", () => {
    const params = new URLSearchParams("order=invalid");
    const result = parseQueryParams(params);
    expect(result.order).toBe("desc");
  });

  it("parses search query", () => {
    const params = new URLSearchParams("search=fintech");
    const result = parseQueryParams(params);
    expect(result.search).toBe("fintech");
  });

  it("parses filter parameters", () => {
    const params = new URLSearchParams("filter[stage]=series_a&filter[sector]=fintech");
    const result = parseQueryParams(params);
    expect(result.filters).toEqual({ stage: "series_a", sector: "fintech" });
  });

  it("ignores non-filter parameters", () => {
    const params = new URLSearchParams("page=1&random=value");
    const result = parseQueryParams(params);
    expect(result.filters).toEqual({});
  });
});

describe("buildPaginationMeta", () => {
  it("correctly calculates hasMore when more pages exist", () => {
    const meta = buildPaginationMeta(100, 1, 20);
    expect(meta).toEqual({ total: 100, page: 1, limit: 20, hasMore: true });
  });

  it("correctly calculates hasMore when on last page", () => {
    const meta = buildPaginationMeta(100, 5, 20);
    expect(meta).toEqual({ total: 100, page: 5, limit: 20, hasMore: false });
  });

  it("handles empty results", () => {
    const meta = buildPaginationMeta(0, 1, 20);
    expect(meta).toEqual({ total: 0, page: 1, limit: 20, hasMore: false });
  });

  it("handles exact page boundary", () => {
    const meta = buildPaginationMeta(40, 2, 20);
    expect(meta.hasMore).toBe(false);
  });
});
