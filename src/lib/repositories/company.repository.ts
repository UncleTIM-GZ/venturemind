import { companies } from "@/db/schema";
import { BaseRepository } from "./base";
import type { DrizzleClient } from "@/db/client";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type CompanyInsert = InferInsertModel<typeof companies>;
export type CompanySelect = InferSelectModel<typeof companies>;

export class CompanyRepository extends BaseRepository<CompanyInsert, CompanySelect> {
  constructor(db: DrizzleClient) {
    super(db, companies);
  }
}

export function createCompanyRepository(db: DrizzleClient): CompanyRepository {
  return new CompanyRepository(db);
}
