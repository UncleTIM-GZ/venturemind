# VentureMind — Product Requirements Document (PRD)

**Version:** 1.0.0
**Date:** 2026-03-21
**Status:** Ready for Review
**Product:** VentureMind — AI-Native VC Project Management Platform

---

## 1. Executive Summary

VentureMind is a full-stack, AI-native project management platform built for small-to-medium Venture Capital firms (managing $50M–$500M AUM, teams of 2–15 people). Unlike existing tools that bolt AI onto traditional CRUD interfaces, VentureMind makes AI the primary interaction paradigm — conversation-first, proactive intelligence, and AI-drafted outputs with human review.

**Key Differentiator:** No existing VC tool is truly AI-native. Competitors (Edda, Affinity, 4Degrees, DealCloud) bolt AI onto traditional form-based CRUD. VentureMind makes AI the primary interaction layer — you talk to it, it drafts, you review.

---

## 2. Problem Statement

Small-to-medium VC firms operate with lean teams but face the same complexity as large funds:

| Pain Point | Current State | VentureMind Solution | Impact |
|------------|---------------|---------------------|--------|
| Deal flow chaos | Deals from email, WeChat, LinkedIn, referrals — no single source of truth | AI chat intake: "Log a deal: Series A, fintech, $5M" | < 2 min (from 15+ min) |
| Memo & DD drudgery | Investment memos take 4-8 hours to draft | AI DurableAgent generates structured draft | < 5 min |
| Portfolio black holes | Metrics reported inconsistently, problems surface too late | Real-time health scoring + anomaly alerts | Real-time (from monthly) |
| LP reporting pain | Quarterly reports take 2-3 weeks to assemble | AI assembles data + drafts narrative | < 1 hour |
| Relationship entropy | Network data lives in individual heads and inboxes | Relationship graph with warm intro finder | 3x more intros |
| Tool fragmentation | Airtable + Google Sheets + Notion + email + WeChat | Single integrated platform | Unified |

---

## 3. Target Market

- **Primary:** Small-to-medium VC firms (10-50 portfolio companies, 2-15 team members, $50M-$500M AUM)
- **Secondary:** Family offices, angel syndicates, micro-PE firms
- **Geography:** Global, with English + Chinese language support

### User Personas

| Persona | Role | Primary Needs |
|---------|------|---------------|
| GP / Managing Partner | Investment decisions, LP relations | Pipeline overview, IC workflow, LP reports |
| Associate / Analyst | Deal sourcing, due diligence, memo writing | Quick deal logging, AI memo drafting, document search |
| Operations / Back-office | Fund admin, reporting, compliance | Data export, audit trail, notice generation |
| LP (read-only portal) | Performance monitoring | Reports, fund metrics, data room access |

---

## 4. Competitive Landscape

| Product | Strength | Weakness | AI Status |
|---------|----------|----------|-----------|
| Edda (Kushim) | End-to-end platform, 160+ firms, $170B+ AUM | Enterprise pricing, limited AI | AI-augmented (basic) |
| Affinity | Relationship intelligence, auto-CRM | Not VC-specific, no portfolio mgmt | AI for relationship scoring |
| 4Degrees | Network mapping, warm intros | Limited portfolio features | Basic AI suggestions |
| DealCloud | Enterprise PE/VC, deep customization | Very expensive, complex setup | Minimal AI |
| Standard Metrics | Best-in-class portfolio reporting, 9000+ companies | Reporting-only, no deal flow | AI Analyst (NLP queries) |
| Visible | LP reporting + fundraising | Limited deal flow | Basic analytics |
| Attio | Modern CRM, flexible data model | Generic, not VC-specific | AI search |

---

## 5. AI-Native Design Principles

1. **Conversation-first, not form-first** — Every entity can be created, updated, and queried through natural language. Forms exist as structured fallback.
2. **AI drafts, human decides** — Investment memos, LP reports, portfolio summaries are AI-drafted. Humans review, edit, and approve — never start from blank page.
3. **Proactive intelligence** — The system surfaces insights without being asked: "Company X's burn rate increased 40% — runway is now 8 months."
4. **Context-aware agents** — Each workflow has a specialized AI agent that understands the domain.
5. **Network as knowledge graph** — Relationships form a queryable graph that powers warm intro suggestions and deal sourcing.

### AI Interaction Modes

- **Chat sidebar** — Open-ended queries, multi-step workflows, exploration
- **Command palette (Cmd+K)** — Quick actions: "new deal", "score deal X", "draft memo for Y"
- **Inline AI** — Context-sensitive AI buttons on every entity card

### AI Output Review Flow

```
AI generates → Preview with diff/highlights → Human edits → Approve/Reject → Save
```

---

## 6. Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16 (App Router) | Server Components, streaming, proxy.ts |
| UI | shadcn/ui + Geist + AI Elements | Design system, AI chat components |
| Auth | Clerk (Vercel Marketplace) | Multi-tenant, org support, RBAC |
| Database | Neon Postgres + pgvector + RLS | Serverless, branching, vector search, tenant isolation |
| ORM | Drizzle ORM | Type-safe, schema-first, explicit queries |
| Cache | Upstash Redis | Session, rate limiting, AI response cache |
| File Storage | Vercel Blob | Pitch decks, documents, reports (up to 5TB) |
| AI | AI Gateway (OIDC) + AI SDK v6 | Model routing, no API keys, streaming |
| Background Jobs | Vercel Queues | Portfolio metrics, report gen, alerts |
| Feature Flags | Edge Config + Vercel Flags | Gradual rollout, per-fund feature control |
| Observability | Vercel Analytics + Speed Insights | Performance monitoring, Core Web Vitals |
| Deployment | Vercel Platform | Preview URLs, CI/CD, zero-config |

---

## 7. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ AI Chat  │ │Dashboard │ │ Pipeline │ │  LP Portal │ │
│  │ Sidebar  │ │  Views   │ │  Kanban  │ │  (Public)  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ │
│       │             │            │              │        │
│  ┌────┴─────────────┴────────────┴──────────────┴────┐  │
│  │      AI Elements + AI SDK v6 (useChat)             │  │
│  │      + Command Palette (Cmd+K)                     │  │
│  └────────────────────────┬──────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ SSE/Streaming
┌───────────────────────────┼──────────────────────────────┐
│                  Backend (Vercel Functions)               │
│  ┌────────────┐ ┌────────┴───────┐ ┌──────────────────┐ │
│  │ API Routes │ │  AI Agents     │ │  Background Jobs  │ │
│  │ (CRUD)     │ │  (Agent class) │ │  (Vercel Queues)  │ │
│  │            │ │  + DurableAgent│ │  + Cron Jobs      │ │
│  └─────┬──────┘ └────────┬───────┘ └────────┬─────────┘ │
│        │                 │                   │           │
│  ┌─────┴─────────────────┴───────────────────┴────────┐  │
│  │              Service Layer (Repository Pattern)     │  │
│  │  DealService │ PortfolioService │ ReportService     │  │
│  │  ContactService │ MemoService │ MeetingService      │  │
│  └──────────────────────┬─────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│                   Data Layer                              │
│  ┌──────────┐  ┌────────┴──────┐  ┌───────────────────┐ │
│  │  Neon    │  │  AI Gateway   │  │  Vercel Blob      │ │
│  │ Postgres │  │  (OIDC auth)  │  │  (docs, decks)    │ │
│  │  + RLS   │  │  model routing│  │                   │ │
│  │  +pgvector│ └───────────────┘  └───────────────────┘ │
│  └──────────┘  ┌───────────────┐  ┌───────────────────┐ │
│  ┌──────────┐  │  Edge Config  │  │  Vercel Queues    │ │
│  │ Upstash  │  │  (flags)      │  │  (async jobs)     │ │
│  │ Redis    │  └───────────────┘  └───────────────────┘ │
│  └──────────┘                                            │
└──────────────────────────────────────────────────────────┘
```

### AI Agent Architecture

```
┌──────────────────────────────────────────────┐
│            AI Gateway (OIDC auth)              │
│  anthropic/claude-sonnet-4.6  (default)       │
│  google/gemini-3.1-flash      (fast tasks)    │
│  anthropic/claude-opus-4.6    (deep analysis) │
└────────────────┬─────────────────────────────┘
                 │
    ┌────────────┼──────────────┐
    │            │              │
┌───┴────┐ ┌────┴─────┐ ┌─────┴─────┐
│ Deal   │ │Portfolio │ │ Report    │
│ Agent  │ │ Agent    │ │ Agent     │
│        │ │          │ │(Durable)  │
│ Tools: │ │ Tools:   │ │ Tools:    │
│-create │ │-getMetric│ │-queryData │
│-score  │ │-setHealth│ │-formatSec │
│-memo   │ │-anomaly  │ │-genChart  │
│-compare│ │-benchmark│ │-draftText │
│-enrich │ │-alert    │ │-exportPDF │
└────────┘ └──────────┘ └───────────┘
    │            │              │
┌───┴────┐ ┌────┴─────┐ ┌─────┴─────┐
│Network │ │ Meeting  │ │  Triage   │
│ Agent  │ │ Agent    │ │  Agent    │
│        │ │          │ │           │
│ Tools: │ │ Tools:   │ │ Tools:    │
│-findPath│ │-summarize│ │-classify  │
│-suggest│ │-extract  │ │-route     │
│-enrich │ │-parseDeck│ │-prioritize│
│-score  │ │-linkEntity││-briefing  │
└────────┘ └──────────┘ └───────────┘
```

### Model Routing Strategy

| Task Type | Model | Cost |
|-----------|-------|------|
| Classification, extraction, scoring | `google/gemini-3.1-flash` | ~$0.001/req |
| Memo drafting, summaries, chat | `anthropic/claude-sonnet-4.6` | ~$0.01/req |
| IC decision support, market analysis | `anthropic/claude-opus-4.6` | ~$0.10/req |
| Document OCR/parsing | `google/gemini-3.1-flash` | ~$0.002/req |

**AI Cost Estimate:** ~$3-5/fund/month

---

## 8. Data Model (ERD)

### Core Entities (16)

| Entity | Description | Key Fields |
|--------|-------------|------------|
| Organization | Management company (Clerk org) | name, slug, plan, settings |
| Fund | Investment vehicle | org_id, name, vintage, size, strategy, status |
| Company | Any company (prospect or portfolio) | name, sector, stage, description, embedding |
| Deal | Investment opportunity in pipeline | fund_id, company_id, stage, score |
| Round | Funding round | company_id, type, amount, valuation |
| Investment | Completed investment | fund_id, round_id, amount, ownership_pct |
| Contact | Person in network | name, title, relationship_strength, embedding |
| LP | Limited partner | fund_id, name, type, commitment |
| InvestmentMemo | AI-generated memo | deal_id, sections_json, status, version |
| CompanyMetric | KPI data point | company_id, metric_type, value, period |
| Report | LP/internal report | fund_id, type, sections, status |
| Meeting | Meeting record | participants, deal_id, summary |
| Task | Action item | assignee_id, due_date, status |
| ICDecision | IC decision | deal_id, outcome, conditions |
| Tag | Entity tag | name, color, entity_type |
| AuditLog | Immutable audit trail | action, entity_type, diff_json |

### Multi-Tenancy Strategy

```
Organization (Clerk org)
  └── Fund (tenant boundary for data)
       └── All data scoped to fund_id via RLS
```

---

## 9. Module Overview (9 Specs)

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

### Dependency Graph

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

---

## 10. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Dashboard load | < 2 seconds |
| AI first token | < 500ms |
| API list endpoints (25 items) | < 200ms |
| API detail endpoints | < 100ms |
| Lighthouse score | > 90 |
| Network graph (500 nodes) | 60fps |
| Warm intro path (10K contacts) | < 500ms |

### Security

- Row-Level Security (RLS) for tenant isolation at database level
- LP PII never sent to AI Gateway prompts
- Signed URLs for all document access (1-hour expiry)
- Audit logging for all data changes and LP data access
- AI data sanitization before sending financial data to LLMs
- Separate auth context for LP portal

### Quality

- 80%+ test coverage on service layer
- E2E tests for critical flows
- WCAG 2.1 AA accessibility compliance
- Structured output schemas (Zod) for all AI outputs

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deal logging time | < 2 min (from 15 min) | Time from deal receipt to CRM entry |
| Memo first draft | < 5 min (from 4-8 hours) | AI draft generation time |
| LP report assembly | < 1 hour (from 2-3 weeks) | Time from data to published report |
| Portfolio visibility | Real-time (from monthly) | Metric freshness |
| Network utilization | 3x more warm intros | Intro requests via platform |
| Daily active users | >80% of team | Login frequency |
| AI acceptance rate | >70% of AI drafts accepted | Draft approval ratio |

---

## 12. Risk Analysis

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI hallucination in financial data | High | Medium | Structured output schemas, human-in-the-loop, validation against source data |
| LP data breach | Critical | Low | RLS, encryption at rest, audit logs, separate LP auth, AI prompt sanitization |
| AI costs escalating | Medium | Medium | Model routing, response caching, cost tracking via AI Gateway |
| Scope creep across 9 specs | High | High | Strict spec boundaries, MVP-first approach |
| Portfolio company data quality | Medium | High | AI parsing + human validation, standardized intake forms |
| Clerk org setup complexity | Medium | Medium | Clear onboarding flow, handle no-org state explicitly |

---

## 13. Dependencies & Prerequisites

- Vercel account with AI Gateway enabled
- Clerk account (via Vercel Marketplace)
- Neon Postgres (via Vercel Marketplace)
- Upstash Redis (via Vercel Marketplace)
- Domain name for LP portal
- Sample data for demo (anonymized)
- `vercel link` + `vercel env pull` for OIDC credentials

---

## 14. Twig Loop Project

**Published to Twig Loop** on 2026-03-21.

- **Project ID:** `c0fbf014-3f7f-4491-95eb-1afddf0a649b`
- **Status:** `open_for_collaboration`
- **Canonical Repo:** `https://github.com/UncleTIM-GZ/venturemind`
- **Work Packages:** 4 phases, 9 task cards
- **Total EWU:** 9.00
