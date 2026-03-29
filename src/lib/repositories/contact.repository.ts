import { contacts } from "@/db/schema";
import { BaseRepository } from "./base";
import type { DrizzleClient } from "@/db/client";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type ContactInsert = InferInsertModel<typeof contacts>;
export type ContactSelect = InferSelectModel<typeof contacts>;

export class ContactRepository extends BaseRepository<ContactInsert, ContactSelect> {
  constructor(db: DrizzleClient) {
    super(db, contacts);
  }
}

export function createContactRepository(db: DrizzleClient): ContactRepository {
  return new ContactRepository(db);
}
