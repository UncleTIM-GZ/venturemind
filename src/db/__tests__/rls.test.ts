import { describe, it, expect } from "vitest";
import { RLS_TABLES, generateRlsMigrationSql } from "../rls";

describe("Row-Level Security", () => {
  describe("RLS_TABLES", () => {
    it("includes all 12 org-scoped tables", () => {
      expect(RLS_TABLES).toHaveLength(12);
    });

    it("includes core entity tables", () => {
      expect(RLS_TABLES).toContain("funds");
      expect(RLS_TABLES).toContain("companies");
      expect(RLS_TABLES).toContain("deals");
      expect(RLS_TABLES).toContain("contacts");
      expect(RLS_TABLES).toContain("lps");
      expect(RLS_TABLES).toContain("tags");
      expect(RLS_TABLES).toContain("audit_logs");
    });

    it("excludes tables without direct org_id", () => {
      expect(RLS_TABLES).not.toContain("rounds");
      expect(RLS_TABLES).not.toContain("investments");
      expect(RLS_TABLES).not.toContain("company_metrics");
    });

    it("excludes the organizations table itself", () => {
      expect(RLS_TABLES).not.toContain("organizations");
    });
  });

  describe("generateRlsMigrationSql", () => {
    const sql = generateRlsMigrationSql();

    it("generates SQL output", () => {
      expect(sql).toBeTruthy();
      expect(sql.length).toBeGreaterThan(100);
    });

    it("enables RLS on each table", () => {
      for (const table of RLS_TABLES) {
        expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      }
    });

    it("forces RLS on each table", () => {
      for (const table of RLS_TABLES) {
        expect(sql).toContain(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);
      }
    });

    it("creates SELECT policy for each table", () => {
      for (const table of RLS_TABLES) {
        expect(sql).toContain(`CREATE POLICY tenant_read_${table} ON ${table} FOR SELECT`);
      }
    });

    it("creates INSERT policy for each table", () => {
      for (const table of RLS_TABLES) {
        expect(sql).toContain(`CREATE POLICY tenant_insert_${table} ON ${table} FOR INSERT`);
      }
    });

    it("creates UPDATE policy for each table", () => {
      for (const table of RLS_TABLES) {
        expect(sql).toContain(`CREATE POLICY tenant_update_${table} ON ${table} FOR UPDATE`);
      }
    });

    it("creates DELETE policy for each table", () => {
      for (const table of RLS_TABLES) {
        expect(sql).toContain(`CREATE POLICY tenant_delete_${table} ON ${table} FOR DELETE`);
      }
    });

    it("references app.current_org_id setting", () => {
      expect(sql).toContain("current_setting('app.current_org_id'");
    });

    it("generates 4 policies per table (CRUD)", () => {
      for (const table of RLS_TABLES) {
        const readCount = (sql.match(new RegExp(`tenant_read_${table}`, "g")) ?? []).length;
        const insertCount = (sql.match(new RegExp(`tenant_insert_${table}`, "g")) ?? []).length;
        const updateCount = (sql.match(new RegExp(`tenant_update_${table}`, "g")) ?? []).length;
        const deleteCount = (sql.match(new RegExp(`tenant_delete_${table}`, "g")) ?? []).length;
        expect(readCount).toBe(1);
        expect(insertCount).toBe(1);
        expect(updateCount).toBe(1);
        expect(deleteCount).toBe(1);
      }
    });
  });
});
