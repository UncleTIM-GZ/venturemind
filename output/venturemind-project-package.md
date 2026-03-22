---
project: VentureMind
version: 1.0.0
date: 2026-03-20
status: ready_for_review
total_specs: 9
total_effort: "63 days (~9 weeks)"
---

# VentureMind — AI-Native VC Project Management Platform

## Project Summary

VentureMind is a full-stack, AI-native project management platform built for small-to-medium Venture Capital firms (managing $50M–$500M AUM, teams of 2–15 people). Unlike existing tools that bolt AI onto traditional CRUD interfaces, VentureMind makes AI the primary interaction paradigm — conversation-first, proactive intelligence, and AI-drafted outputs with human review.

## Target Market

- **Primary**: Small-to-medium VC firms (10-50 portfolio companies, 2-15 team members)
- **Secondary**: Family offices, angel syndicates, micro-PE firms
- **Geography**: Global, with English + Chinese language support

## Core Value Proposition

| Pain Point | VentureMind Solution | Impact |
|------------|---------------------|--------|
| Deal logging takes 15+ min | AI chat intake: "Log a deal: Series A, fintech, $5M" | < 2 min |
| Memo drafting takes 4-8 hours | AI DurableAgent generates structured draft | < 5 min |
| LP reports take 2-3 weeks | AI assembles data + drafts narrative | < 1 hour |
| Portfolio health is monthly | Real-time health scoring + anomaly alerts | Real-time |
| Network lives in people's heads | Relationship graph with warm intro finder | 3x more intros |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), shadcn/ui, Geist, AI Elements |
| Auth | Clerk (Vercel Marketplace) — org multi-tenancy, RBAC |
| Database | Neon Postgres + pgvector + RLS (Vercel Marketplace) |
| ORM | Drizzle ORM |
| Cache | Upstash Redis (Vercel Marketplace) |
| Storage | Vercel Blob (documents, pitch decks) |
| AI | AI Gateway (OIDC) + AI SDK v6 — model routing |
| Background | Vercel Queues (async jobs, event processing) |
| Features | Edge Config + Vercel Flags |
| Deploy | Vercel Platform |

## AI Architecture

- **Triage Agent**: Routes user intent from chat/command palette to domain agents
- **Deal Agent**: Scoring, comparison, enrichment, email parsing
- **Portfolio Agent**: Health scoring, anomaly detection, benchmarking
- **Report Agent** (DurableAgent): LP report generation, multi-step workflow
- **Memo Agent** (DurableAgent): Investment memo generation, section-by-section
- **Network Agent**: Relationship scoring, warm intro path finding
- **Meeting Agent**: Summarization, action item extraction, entity linking

**Model Routing**: Gemini Flash (fast/cheap) → Sonnet 4.6 (standard) → Opus 4.6 (deep analysis)

## Spec Overview

| Spec | Module | Effort | Dependencies | Phase |
|------|--------|--------|-------------|-------|
| 1 | Foundation & Auth | 5 days | — | 1 |
| 2 | Data Model & API | 7 days | Spec 1 | 1 |
| 3 | Deal Flow Pipeline | 7 days | Specs 1, 2 | 2 |
| 4 | AI Memo & DD Engine | 8 days | Specs 2, 3 | 2 |
| 5 | Portfolio Dashboard | 7 days | Specs 1, 2 | 2 |
| 6 | LP Portal & Reporting | 8 days | Specs 2, 5 | 3 |
| 7 | Contact CRM & Network | 7 days | Specs 1, 2 | 3 |
| 8 | Meeting & Document AI | 7 days | Specs 2, 3 | 4 |
| 9 | Team Workspace & IC | 7 days | Specs 1, 2 | 4 |

**Total: 63 days (~9 weeks, 1 spec per sprint)**

## Dependency Graph

```
Phase 1:  [Spec 1: Foundation] → [Spec 2: Data Model]
              │                       │
Phase 2:  [Spec 3: Deals] ──────────┤
          [Spec 5: Portfolio] ───────┤
              │                      │
Phase 3:  [Spec 4: Memos] ← Spec 3  │
          [Spec 6: LP Reports] ← Spec 5
          [Spec 7: Network] ────────┘
              │
Phase 4:  [Spec 8: Documents] ← Spec 3
          [Spec 9: Team/IC] ────────┘
```

## Key Design Decisions

1. **Single Next.js app** (not Turborepo monorepo) — Keep simple until multi-app is needed
2. **Drizzle ORM** (not Prisma) — Better TypeScript inference, lighter runtime, explicit queries
3. **RLS in Neon** — Database-level tenant isolation, not just application-level WHERE clauses
4. **DurableAgent for long workflows** — Memo and report generation survive crashes via Workflow DevKit
5. **Repository pattern** — All data access behind interfaces for testability and tenant scoping
6. **AI Elements for all AI text** — Never render AI markdown as raw text; use MessageResponse
7. **Conversation-first + Command palette** — Dual AI interaction modes for different needs

## Deliverables Per Spec

Each spec produces:
- Feature implementation (components, API routes, services)
- Database migrations (if applicable)
- Unit tests (80%+ coverage on service layer)
- Integration tests for critical paths
- Updated CLAUDE.md with new patterns/conventions

## Success Criteria

- All 9 specs implemented and integrated
- AI chat can CRUD all entities
- 80%+ test coverage on service layer
- Dashboard loads < 2s
- AI first token < 500ms
- Lighthouse > 90
- Security: RLS + audit logging + AI data sanitization

## Links

- **Plan**: `docs/plans/2026-03-20-feat-vc-ai-native-project-management-plan.md`
- **Specs**: `docs/specs/spec-01-*.md` through `spec-09-*.md`
- **Task Cards**: `output/task-cards/card-01-*.md` through `card-09-*.md`
