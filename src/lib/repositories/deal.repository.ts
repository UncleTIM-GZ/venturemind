import { deals } from "@/db/schema";
import { BaseRepository } from "./base";
import type { DrizzleClient } from "@/db/client";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type DealInsert = InferInsertModel<typeof deals>;
export type DealSelect = InferSelectModel<typeof deals>;

export class DealRepository extends BaseRepository<DealInsert, DealSelect> {
  constructor(db: DrizzleClient) {
    super(db, deals);
  }
}

export function createDealRepository(db: DrizzleClient): DealRepository {
  return new DealRepository(db);
}
