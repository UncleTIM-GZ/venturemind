import { eq, and, sql, desc, asc } from "drizzle-orm";
import type { DrizzleClient } from "@/db/client";
import {
  type PaginatedResult,
  type QueryOptions,
  buildPaginationMeta,
} from "@/lib/api/pagination";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPgTable = any;

export class BaseRepository<
  TInsert extends Record<string, unknown>,
  TSelect extends Record<string, unknown>,
> {
  constructor(
    protected readonly db: DrizzleClient,
    protected readonly table: AnyPgTable,
  ) {}

  async findAll(
    orgId: string,
    opts: QueryOptions,
  ): Promise<PaginatedResult<TSelect>> {
    const { page, limit, order } = opts;
    const offset = (page - 1) * limit;

    const t = this.table as any;
    const whereClause = eq(t.orgId, orgId);
    const orderClause = order === "asc" ? asc(t.createdAt) : desc(t.createdAt);

    const [rows, countResult] = await Promise.all([
      (this.db as any)
        .select()
        .from(this.table)
        .where(whereClause)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      (this.db as any)
        .select({ count: sql<number>`count(*)::int` })
        .from(this.table)
        .where(whereClause),
    ]);

    const total = (countResult as { count: number }[])[0]?.count ?? 0;

    return {
      data: rows as TSelect[],
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(orgId: string, id: string): Promise<TSelect | null> {
    const t = this.table as any;
    const rows = await (this.db as any)
      .select()
      .from(this.table)
      .where(and(eq(t.id, id), eq(t.orgId, orgId)))
      .limit(1);

    return (rows as TSelect[])[0] ?? null;
  }

  async create(orgId: string, data: Record<string, unknown>): Promise<TSelect> {
    const rows = await (this.db as any)
      .insert(this.table)
      .values({ ...data, orgId })
      .returning();

    return (rows as TSelect[])[0];
  }

  async update(
    orgId: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<TSelect | null> {
    const t = this.table as any;
    const rows = await (this.db as any)
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(t.id, id), eq(t.orgId, orgId)))
      .returning();

    return (rows as TSelect[])[0] ?? null;
  }

  async delete(orgId: string, id: string): Promise<boolean> {
    const t = this.table as any;
    const rows = await (this.db as any)
      .delete(this.table)
      .where(and(eq(t.id, id), eq(t.orgId, orgId)))
      .returning({ id: t.id });

    return (rows as { id: string }[]).length > 0;
  }
}
