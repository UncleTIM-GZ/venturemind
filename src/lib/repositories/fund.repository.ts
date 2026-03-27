import { funds } from "@/db/schema";
import { BaseRepository } from "./base";
import type { DrizzleClient } from "@/db/client";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type FundInsert = InferInsertModel<typeof funds>;
export type FundSelect = InferSelectModel<typeof funds>;

export class FundRepository extends BaseRepository<FundInsert, FundSelect> {
  constructor(db: DrizzleClient) {
    super(db, funds);
  }
}

export function createFundRepository(db: DrizzleClient): FundRepository {
  return new FundRepository(db);
}
