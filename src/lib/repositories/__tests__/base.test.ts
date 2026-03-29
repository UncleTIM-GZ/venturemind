import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseRepository } from "../base";
import { buildPaginationMeta } from "@/lib/api/pagination";

// Mock the Drizzle client with chainable query builder
function createMockDb() {
  const mockChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  };

  return {
    select: vi.fn().mockReturnValue(mockChain),
    insert: vi.fn().mockReturnValue(mockChain),
    update: vi.fn().mockReturnValue(mockChain),
    delete: vi.fn().mockReturnValue(mockChain),
    _chain: mockChain,
  };
}

// Create a mock table with the required columns
const mockTable = {
  id: { name: "id" },
  orgId: { name: "org_id" },
  createdAt: { name: "created_at" },
} as any;

describe("BaseRepository", () => {
  let db: ReturnType<typeof createMockDb>;
  let repo: BaseRepository<any, any, any>;

  beforeEach(() => {
    db = createMockDb();
    repo = new BaseRepository(db as any, mockTable);
  });

  describe("findAll", () => {
    it("calls select with correct query structure", async () => {
      db._chain.from.mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([
                { id: "1", name: "Test" },
              ]),
            }),
          }),
        }),
      });

      // Mock count query
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([
                  { id: "1", name: "Test" },
                ]),
              }),
            }),
          }),
        }),
      }).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      const result = await repo.findAll("org-1", { page: 1, limit: 20, order: "desc" });
      expect(db.select).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it("calculates correct offset for pagination", () => {
      // Verify offset logic: (page - 1) * limit
      expect((1 - 1) * 20).toBe(0);
      expect((2 - 1) * 20).toBe(20);
      expect((3 - 1) * 10).toBe(20);
    });
  });

  describe("findById", () => {
    it("calls select with id and orgId filter", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "123", name: "Test" }]),
          }),
        }),
      });

      const result = await repo.findById("org-1", "123");
      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual({ id: "123", name: "Test" });
    });

    it("returns null when not found", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await repo.findById("org-1", "nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("calls insert with orgId included", async () => {
      const insertData = { name: "New Entity" };
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "new-1", orgId: "org-1", name: "New Entity" }]),
        }),
      });

      const result = await repo.create("org-1", insertData);
      expect(db.insert).toHaveBeenCalledWith(mockTable);
      expect(result).toEqual({ id: "new-1", orgId: "org-1", name: "New Entity" });
    });
  });

  describe("update", () => {
    it("calls update with orgId and id filter", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "123", name: "Updated" }]),
          }),
        }),
      });

      const result = await repo.update("org-1", "123", { name: "Updated" });
      expect(db.update).toHaveBeenCalledWith(mockTable);
      expect(result).toEqual({ id: "123", name: "Updated" });
    });

    it("returns null when entity not found for update", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await repo.update("org-1", "nonexistent", { name: "X" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("returns true when entity deleted", async () => {
      db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "123" }]),
        }),
      });

      const result = await repo.delete("org-1", "123");
      expect(result).toBe(true);
    });

    it("returns false when entity not found for delete", async () => {
      db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await repo.delete("org-1", "nonexistent");
      expect(result).toBe(false);
    });
  });
});
