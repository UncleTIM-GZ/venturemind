import { z } from "zod";

// --- Deal ---
export const createDealSchema = z.object({
  fundId: z.string().uuid(),
  companyId: z.string().uuid(),
  title: z.string().min(1).max(255),
  stage: z.enum(["sourced", "screening", "due_diligence", "ic_review", "term_sheet", "closed_won", "closed_lost", "passed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  source: z.string().max(100).optional(),
});

export const updateDealSchema = createDealSchema.partial();

// --- Company ---
export const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  sector: z.string().max(100).optional(),
  stage: z.enum(["pre_seed", "seed", "series_a", "series_b", "series_c", "series_d", "growth", "pre_ipo", "public"]).optional(),
  website: z.string().url().max(500).optional(),
  description: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

// --- Contact ---
export const createContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  type: z.enum(["founder", "executive", "investor", "advisor", "lp", "other"]).optional(),
  title: z.string().max(200).optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().max(500).optional(),
});

export const updateContactSchema = createContactSchema.partial();

// --- Fund ---
export const createFundSchema = z.object({
  name: z.string().min(1).max(255),
  vintageYear: z.number().int().min(1990).max(2100),
  targetSizeUsd: z.number().int().positive(),
  status: z.enum(["raising", "active", "fully_deployed", "harvesting", "closed"]).optional(),
});

export const updateFundSchema = createFundSchema.partial();

// --- LP ---
export const createLpSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["individual", "family_office", "institution", "fund_of_funds", "endowment", "pension", "other"]),
  committedCapitalUsd: z.number().int().min(0).optional(),
  contactId: z.string().uuid().optional(),
});

export const updateLpSchema = createLpSchema.partial();

// --- Investment ---
export const createInvestmentSchema = z.object({
  fundId: z.string().uuid(),
  dealId: z.string().uuid(),
  companyId: z.string().uuid(),
  amountUsd: z.number().int().positive(),
  ownershipPercentage: z.string().optional(),
  instrument: z.enum(["equity", "safe", "convertible_note", "warrant"]),
});

export const updateInvestmentSchema = createInvestmentSchema.partial();

// --- Meeting ---
export const createMeetingSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().datetime(),
  type: z.enum(["pitch", "follow_up", "board", "ic", "internal", "lp_update", "other"]).optional(),
  summary: z.string().optional(),
  location: z.string().max(255).optional(),
});

export const updateMeetingSchema = createMeetingSchema.partial();

// --- Task ---
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assigneeId: z.string().max(255).optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().optional(),
  dealId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// --- Tag ---
export const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  category: z.string().max(50).optional(),
});

export const updateTagSchema = createTagSchema.partial();

// --- Report ---
export const createReportSchema = z.object({
  fundId: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: z.enum(["quarterly", "annual", "capital_call", "distribution", "ad_hoc"]),
  status: z.enum(["draft", "in_review", "approved", "published"]).optional(),
});

export const updateReportSchema = createReportSchema.partial();
