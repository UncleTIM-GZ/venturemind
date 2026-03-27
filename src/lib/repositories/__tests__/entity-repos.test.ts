import { describe, it, expect, vi } from "vitest";
import { DealRepository, createDealRepository } from "../deal.repository";
import { CompanyRepository, createCompanyRepository } from "../company.repository";
import { ContactRepository, createContactRepository } from "../contact.repository";
import { FundRepository, createFundRepository } from "../fund.repository";

// Minimal mock DB
const mockDb = {} as any;

describe("Entity Repository Factories", () => {
  describe("DealRepository", () => {
    it("creates an instance via factory", () => {
      const repo = createDealRepository(mockDb);
      expect(repo).toBeInstanceOf(DealRepository);
    });

    it("extends BaseRepository", () => {
      const repo = new DealRepository(mockDb);
      expect(repo).toHaveProperty("findAll");
      expect(repo).toHaveProperty("findById");
      expect(repo).toHaveProperty("create");
      expect(repo).toHaveProperty("update");
      expect(repo).toHaveProperty("delete");
    });
  });

  describe("CompanyRepository", () => {
    it("creates an instance via factory", () => {
      const repo = createCompanyRepository(mockDb);
      expect(repo).toBeInstanceOf(CompanyRepository);
    });

    it("extends BaseRepository", () => {
      const repo = new CompanyRepository(mockDb);
      expect(repo).toHaveProperty("findAll");
      expect(repo).toHaveProperty("findById");
      expect(repo).toHaveProperty("create");
      expect(repo).toHaveProperty("update");
      expect(repo).toHaveProperty("delete");
    });
  });

  describe("ContactRepository", () => {
    it("creates an instance via factory", () => {
      const repo = createContactRepository(mockDb);
      expect(repo).toBeInstanceOf(ContactRepository);
    });

    it("extends BaseRepository", () => {
      const repo = new ContactRepository(mockDb);
      expect(repo).toHaveProperty("findAll");
      expect(repo).toHaveProperty("findById");
      expect(repo).toHaveProperty("create");
      expect(repo).toHaveProperty("update");
      expect(repo).toHaveProperty("delete");
    });
  });

  describe("FundRepository", () => {
    it("creates an instance via factory", () => {
      const repo = createFundRepository(mockDb);
      expect(repo).toBeInstanceOf(FundRepository);
    });

    it("extends BaseRepository", () => {
      const repo = new FundRepository(mockDb);
      expect(repo).toHaveProperty("findAll");
      expect(repo).toHaveProperty("findById");
      expect(repo).toHaveProperty("create");
      expect(repo).toHaveProperty("update");
      expect(repo).toHaveProperty("delete");
    });
  });
});
