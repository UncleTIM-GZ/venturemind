---
card: 2
title: "Core Data Model & API"
project: VentureMind
module: data-layer
priority: critical
status: todo
estimated_effort: "7 days"
dependencies: [1]
assignee: null
tags: [neon, postgres, drizzle, api, rls, pgvector]
---

# Card 2: Core Data Model & API

## Summary

Design and implement the complete database schema with 16 core entities, Row-Level Security for multi-tenant isolation, pgvector for semantic search, and REST API routes with Zod validation.

## Deliverables

- [ ] Neon Postgres provisioned via Vercel Marketplace
- [ ] Drizzle ORM schema for 16 entities + junction tables
- [ ] Database migrations generated and applied
- [ ] Row-Level Security (RLS) policies for tenant isolation
- [ ] pgvector extension enabled, embedding columns on Company + Contact
- [ ] REST API routes (CRUD) for all entities
- [ ] Zod input validation schemas
- [ ] Repository pattern: DealRepository, CompanyRepository, etc.
- [ ] API response envelope: { success, data, error, meta }
- [ ] Seed script with demo data (2 funds, 50 companies, 200 contacts)

## Entities

Organization, Fund, Company, Deal, Round, Investment, Contact, LP, InvestmentMemo, CompanyMetric, Report, Meeting, Task, ICDecision, Tag, AuditLog

## Tech Stack

Neon Postgres, Drizzle ORM, pgvector, Zod, Vercel Functions

## Spec Reference

`docs/specs/spec-02-data-model-api.md`

## Definition of Done

- All migrations run cleanly on fresh Neon database
- RLS policies prevent cross-tenant data access
- API routes return proper envelope format
- Seed data populates successfully
- Type-safe queries via Drizzle with branded ID types
