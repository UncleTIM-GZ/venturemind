/**
 * Row-Level Security helpers for multi-tenant isolation.
 *
 * Strategy: Set `app.current_org_id` on the Postgres session,
 * and RLS policies filter rows by `org_id = current_setting('app.current_org_id')::uuid`.
 */

import type { DrizzleClient } from "./client";
import { sql } from "drizzle-orm";

/**
 * Set the tenant context for the current connection.
 * Must be called before any query that should be tenant-scoped.
 */
export async function setTenantContext(db: DrizzleClient, orgId: string): Promise<void> {
  await db.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);
}

/**
 * Reset the tenant context (for service-level operations).
 */
export async function resetTenantContext(db: DrizzleClient): Promise<void> {
  await db.execute(sql`RESET app.current_org_id`);
}

/**
 * RLS-enabled tables (all tables with org_id column, excluding organizations itself).
 */
export const RLS_TABLES = [
  "funds",
  "companies",
  "deals",
  "contacts",
  "lps",
  "investment_memos",
  "reports",
  "meetings",
  "tasks",
  "ic_decisions",
  "tags",
  "audit_logs",
] as const;

// Tables without direct org_id (rounds, investments, company_metrics)
// are protected through their parent FK relations which have RLS enabled.

/**
 * Generate the SQL for enabling RLS on all tenant-scoped tables.
 * This should be run as a custom migration.
 */
export function generateRlsMigrationSql(): string {
  const statements: string[] = [];

  for (const table of RLS_TABLES) {
    statements.push(`-- RLS for ${table}`);
    statements.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    statements.push(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;`);

    // Read policy — filter by org_id
    statements.push(
      `CREATE POLICY tenant_read_${table} ON ${table} FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::uuid);`
    );

    // Insert policy — ensure new rows match tenant
    statements.push(
      `CREATE POLICY tenant_insert_${table} ON ${table} FOR INSERT WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);`
    );

    // Update policy
    statements.push(
      `CREATE POLICY tenant_update_${table} ON ${table} FOR UPDATE USING (org_id = current_setting('app.current_org_id', true)::uuid);`
    );

    // Delete policy
    statements.push(
      `CREATE POLICY tenant_delete_${table} ON ${table} FOR DELETE USING (org_id = current_setting('app.current_org_id', true)::uuid);`
    );

    statements.push("");
  }

  return statements.join("\n");
}
