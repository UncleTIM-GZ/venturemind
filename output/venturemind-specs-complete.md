# VentureMind — Complete Technical Specifications

**Version:** 1.0.0
**Date:** 2026-03-21
**Total Specs:** 9
**Total Effort:** 63 days (~9 weeks)

---

## Table of Contents

1. [Spec 1: Foundation & Auth](#spec-1-foundation--auth)
2. [Spec 2: Data Model & API](#spec-2-data-model--api)
3. [Spec 3: Deal Flow Pipeline](#spec-3-deal-flow-pipeline)
4. [Spec 4: AI Memo & DD Engine](#spec-4-ai-memo--dd-engine)
5. [Spec 5: Portfolio Dashboard](#spec-5-portfolio-dashboard)
6. [Spec 6: LP Portal & Reporting](#spec-6-lp-portal--reporting)
7. [Spec 7: Contact CRM & Network Graph](#spec-7-contact-crm--network-graph)
8. [Spec 8: Meeting & Document AI](#spec-8-meeting--document-ai)
9. [Spec 9: Team Workspace & IC Flow](#spec-9-team-workspace--ic-flow)

---

# Spec 1: Foundation & Auth

**Module:** foundation-auth | **Effort:** 5 days | **Dependencies:** None | **Phase:** 1

## Objective

Establish the VentureMind project scaffold on Next.js 16 App Router with Clerk-based authentication, organization/fund multi-tenancy, role-based access control, and a polished dark-mode dashboard shell that includes an AI chat panel and command palette.

## User Stories

- As a **fund admin**, I want to create an organization and invite team members with specific roles
- As a **partner**, I want to sign in and land on a dark-mode dashboard with sidebar navigation
- As an **associate**, I want to use Cmd+K to search across deals, companies, and contacts using AI-powered search
- As an **LP investor**, I want read-only access scoped to my fund's data
- As any **authenticated user**, I want to interact with an AI chat panel docked to the side of my workspace
- As a **fund admin**, I want to manage multiple funds under a single organization

## Functional Requirements

- Initialize Next.js 16 App Router project with TypeScript strict mode, ESLint, Prettier, Tailwind CSS 4
- Install and configure shadcn/ui + Geist font (sans + mono)
- Integrate Clerk authentication (email/password, Google OAuth, magic link)
- Implement `proxy.ts` Clerk middleware for route protection and org context injection
- Define 5 roles: Admin, Partner, Associate, Analyst, LP (read-only)
- Support multi-tenancy at org level with sub-isolation per fund
- Build dark-mode dashboard shell: collapsible sidebar + main content + resizable AI chat panel
- Implement Cmd+K command palette with AI-powered semantic search
- Configure environment variable validation via `@t3-oss/env-nextjs`

## Technical Design

### File Structure

```
src/
  app/
    layout.tsx                    # Root layout with Clerk/theme providers
    (auth)/sign-in/[[...sign-in]]/page.tsx
    (auth)/sign-up/[[...sign-up]]/page.tsx
    (dashboard)/layout.tsx        # Dashboard shell
    (dashboard)/page.tsx          # Dashboard home
  components/
    layout/sidebar.tsx, ai-chat-panel.tsx, top-bar.tsx
    ai/conversation.tsx, message.tsx, prompt-input.tsx
    command-palette/command-palette.tsx, ai-search-provider.tsx
  lib/auth/roles.ts, guards.ts, middleware-utils.ts
  proxy.ts                       # Clerk middleware
```

### Role Permission Matrix

| Permission | Admin | Partner | Associate | Analyst | LP |
|-----------|-------|---------|-----------|---------|-----|
| Manage org settings | Yes | No | No | No | No |
| Create/edit deals | Yes | Yes | Yes | No | No |
| IC voting | Yes | Yes | No | No | No |
| View fund reports | Yes | Yes | Yes | Yes | Yes |
| Access AI chat | Yes | Yes | Yes | Yes | No |

### Design Tokens

- Background: `hsl(224, 20%, 6%)` — Surface: `hsl(224, 15%, 10%)`
- Primary accent: `hsl(210, 100%, 52%)` — Font: Geist Sans/Mono
- Radius: 8px default, 12px cards, 16px modals

## Acceptance Criteria

- App boots with Clerk auth flow working
- Users can sign in, create org, invite team members
- Role-based route protection active via middleware
- Dark-mode UI renders correctly with consistent design tokens
- AI chat sidebar opens and can send/receive messages
- Cmd+K opens command palette with keyboard navigation
- Lighthouse accessibility score 90+

---

# Spec 2: Data Model & API

**Module:** data-model-api | **Effort:** 7 days | **Dependencies:** Spec 1 | **Phase:** 1

## Objective

Design and implement the complete Neon Postgres data model with Drizzle ORM, covering 16 core entities plus junction tables, with Row-Level Security for multi-tenant isolation, pgvector columns for semantic search, validated REST API routes, and a repository-pattern data access layer.

## Core Entities (16)

### Organization
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| clerk_org_id | varchar(255) | unique, not null |
| name | varchar(255) | not null |
| slug | varchar(100) | unique, not null |
| plan | enum('free','pro','enterprise') | default 'free' |
| settings | jsonb | default '{}' |

### Fund
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization |
| name | varchar(255) | not null |
| vintage_year | integer | not null |
| target_size_usd | bigint | not null |
| status | enum('raising','active','fully_deployed','harvesting','closed') | default 'active' |

### Company
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization |
| name | varchar(255) | not null |
| sector | varchar(100) | nullable |
| stage | enum('pre_seed','seed','series_a',...,'public') | nullable |
| embedding | vector(1536) | nullable, pgvector |
| archived_at | timestamptz | nullable |

### Deal
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization |
| fund_id | uuid | FK -> Fund |
| company_id | uuid | FK -> Company |
| stage | enum('sourced','screening','due_diligence','ic_review','term_sheet','closed_won','closed_lost','passed') | |
| ai_score | jsonb | nullable |
| priority | enum('low','medium','high','urgent') | default 'medium' |

### Round
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| company_id | uuid | FK -> Company |
| round_type | enum('pre_seed','seed','series_a',...,'safe') | not null |
| pre_money_valuation_usd | bigint | nullable |
| status | enum('open','closed','cancelled') | default 'open' |

### Investment
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| fund_id | uuid | FK -> Fund |
| deal_id | uuid | FK -> Deal |
| company_id | uuid | FK -> Company |
| amount_usd | bigint | not null |
| ownership_percentage | decimal(5,2) | nullable |
| instrument | enum('equity','safe','convertible_note','warrant') | not null |

### Contact
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization |
| first_name, last_name | varchar(100) | not null |
| type | enum('founder','executive','investor','advisor','lp','other') | |
| embedding | vector(1536) | nullable, pgvector |

### LP (Limited Partner)
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization |
| type | enum('individual','family_office','institution',...) | not null |
| committed_capital_usd | bigint | default 0 |

### InvestmentMemo, CompanyMetric, Report, Meeting, Task, ICDecision, Tag, AuditLog

*(Full column definitions in individual spec files under `docs/specs/`)*

### Junction Tables

| Table | Purpose |
|-------|---------|
| deal_tags | Many-to-many deals-tags |
| company_tags | Many-to-many companies-tags |
| contact_companies | Contact-company associations with role |
| fund_lps | LP commitments to funds |
| meeting_attendees | Meeting participants |
| deal_contacts | Contacts involved in a deal |
| deal_stage_history | Deal stage transition log |

## API Design

All endpoints prefixed with `/api/v1/`, authenticated, org-scoped via Clerk session.

**Response Envelope:**
```typescript
type ApiResponse<T> =
  | { success: true; data: T; meta?: { total, page, limit, hasMore } }
  | { success: false; error: string; code: string };
```

**Query Parameters:** `page`, `limit`, `sort`, `order`, `search`, `fields`, `filter[field]`

### Full Endpoint List

60+ REST endpoints covering CRUD for all 16 entities + semantic search endpoint.

## Row-Level Security

```sql
SET app.current_fund_id = 'fund_xxx';
CREATE POLICY tenant_isolation ON deals
  USING (fund_id = current_setting('app.current_fund_id')::uuid);
```

## Acceptance Criteria

- All migrations run cleanly on fresh Neon database
- RLS policies prevent cross-tenant data access
- API endpoints validate input via Zod, return proper envelope format
- Seed data populates 2 orgs, 3 funds, 50 companies, 80 deals, 200 contacts
- Repository methods 80%+ test coverage
- API responses < 200ms (list) / < 100ms (detail)

---

# Spec 3: Deal Flow Pipeline

**Module:** deal-flow-pipeline | **Effort:** 7 days | **Dependencies:** Specs 1, 2 | **Phase:** 2

## Objective

Build a fully interactive deal flow management system with configurable Kanban pipeline, AI-powered deal intake and scoring, batch import, email-to-deal capture, comparison views, and pipeline analytics.

## Key Features

### Kanban Board
- Configurable stages: Sourced → Screening → DD → IC → Term Sheet → Closed/Passed
- Drag-and-drop with @dnd-kit, stage transition confirmation dialog
- Deal cards: company logo, round badge, amount, partner avatar, priority, days-in-stage, AI score
- Filters: fund, assignee, priority, source, sector, tags

### AI Deal Intake
- Parse natural language: "Log a new deal: Series A, fintech, $5M round"
- Extract company, round type, amount, sector, contacts
- Confirmation card in chat before persisting
- Auto-create Company/Contact with dedup check

### AI Deal Scoring

```typescript
const DealAIScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  dimensions: z.object({
    market_opportunity: z.object({ score: z.number(), rationale: z.string() }),
    team_quality: z.object({ score: z.number(), rationale: z.string() }),
    traction_metrics: z.object({ score: z.number(), rationale: z.string() }),
    fund_fit: z.object({ score: z.number(), rationale: z.string() }),
  }),
  recommendation: z.enum(['strong_pass','pass','maybe','invest','strong_invest']),
});
```

### Batch Import
- CSV/Excel upload with column mapping, preview, validation
- Duplicate detection with merge/skip/create options
- Undo within 24 hours

### Email-to-Deal Capture
- Unique inbound email per org
- AI parses forwarded pitch emails, creates deal in "Sourced" stage

### Deal Comparison & Analytics
- Side-by-side comparison with radar chart (Recharts)
- Conversion funnel, stage velocity, source attribution, timeline charts
- KPI cards: Total Active Deals, Avg Days to Close, Win Rate, Pipeline Value

## Acceptance Criteria

- Kanban drag-and-drop updates DB + records stage history
- AI chat input creates deals with correct structured data
- AI scoring returns all 4 dimensions with rationale
- CSV import handles 50 rows with dedup detection
- Pipeline loads < 2s with 200+ active deals

---

# Spec 4: AI Memo & DD Engine

**Module:** memo-dd-engine | **Effort:** 8 days | **Dependencies:** Specs 2, 3 | **Phase:** 2

## Objective

AI-powered investment memo generation using DurableAgent (Workflow DevKit) for crash-resilient multi-step generation, plus DD checklist management and PDF/DOCX export.

## Key Features

### DurableAgent Workflow (4 Steps)

1. **Gather Deal Data** — company profile, metrics, contacts, notes, prior memos
2. **Research Market Context** — AI synthesizes market size, competitors, trends
3. **Draft Sections** — Executive Summary, Market, Team, Financials, Risks, Recommendation (parallel)
4. **Assemble & Format** — combine, cross-reference, ensure consistency

### Memo Features
- Customizable JSON schema templates per fund
- Section-by-section streaming with AI Elements MessageResponse
- Section locking (prevent overwrite during regeneration)
- AI revision: "Make the risk section more conservative"
- AI gap analysis: "What's missing from this memo?"
- Version tracking with side-by-side diff view
- Export to PDF (@react-pdf/renderer) and DOCX

### DD Checklists
- AI-generated checklists: legal, financial, technical, commercial
- Items linkable to evidence documents
- Status tracking: pending → in_progress → completed → not_applicable

### Data Model Additions
- `memo_templates` — JSON schema defining sections
- `memos` — memo records with status workflow
- `memo_versions` — immutable version history
- `memo_ai_logs` — every AI prompt/response for audit
- `dd_checklists` + `dd_checklist_items`

## Acceptance Criteria

- AI generates complete first-draft memo in < 90 seconds
- DurableAgent resumes after crash (tested)
- Section-level revision works without affecting other sections
- PDF export produces branded, professional document
- All AI interactions logged in audit table

---

# Spec 5: Portfolio Dashboard

**Module:** portfolio-dashboard | **Effort:** 7 days | **Dependencies:** Specs 1, 2 | **Phase:** 2

## Objective

Real-time portfolio monitoring dashboard with company health scoring, AI anomaly detection, fund-level performance metrics, and benchmarking.

## Key Features

### Health Scoring

```typescript
const healthScore = weightedAverage([
  { metric: 'runway_months', weight: 0.3, good: '>12', bad: '<6' },
  { metric: 'revenue_growth_mom', weight: 0.25, good: '>10%', bad: '<-5%' },
  { metric: 'burn_rate_trend', weight: 0.2, good: 'decreasing', bad: 'increasing >20%' },
  { metric: 'last_update_days', weight: 0.15, good: '<30', bad: '>90' },
  { metric: 'team_growth', weight: 0.1, good: 'growing', bad: 'shrinking >20%' },
]);
```

### Portfolio Grid
- Company cards with health indicators (green/yellow/red)
- Metric collection: manual entry + AI-parsed email updates
- Sortable columns: name, sector, stage, health score, key metrics

### Anomaly Detection (Vercel Queues)
- Background job flags significant metric deviations (Z-score > 2)
- Alerts: `"Company X reported 60% MoM revenue drop"`
- Severity: info / warning / critical

### Fund Metrics
- IRR, TVPI, DPI, RVPI calculated from transaction + valuation data
- Cached in Redis (1 hour TTL)
- Vintage year breakdown

### Performance Optimization
- Materialized view `mv_portfolio_dashboard` (refreshed every 15 min via cron)
- Server Components for initial render, streaming with Suspense

### Data Model Additions
- `portfolio_companies`, `metric_definitions`, `metric_snapshots`
- `health_scores`, `anomaly_alerts`, `valuation_events`, `sector_benchmarks`

## Acceptance Criteria

- Dashboard loads < 500ms with 100 portfolio companies (materialized view)
- Health indicators correctly reflect AI composite scores
- Anomaly alerts fire within 5 minutes of metric submission
- IRR/TVPI calculations match manual verification
- Fund metrics cached with 1-hour TTL

---

# Spec 6: LP Portal & Reporting

**Module:** lp-portal-reporting | **Effort:** 8 days | **Dependencies:** Specs 2, 5 | **Phase:** 3

## Objective

Secure LP-facing portal with AI-generated quarterly reports, capital call/distribution notices, fund performance visualization, approval workflow, and zero-trust document data room.

## Key Features

### LP Portal
- Configurable subdomain (e.g., `lp.venturemind.co`)
- Separate Clerk auth context for LP users
- Zero-trust data scoping: every query enforced at DB level per-LP
- Fund performance with waterfall charts (GP carry, LP preferred return, splits)

### AI Report Generation (DurableAgent)
1. Aggregate fund + portfolio data for the quarter
2. Generate narrative sections (fund overview, market, highlights, company updates, performance, outlook)
3. Assemble with cross-references and data tables

### Approval Workflow
- Draft → Partner Review → Approve → Publish
- Email notifications at each stage
- Version tracking with diff view

### Capital Call / Distribution Notices
- PDF generation via @react-pdf/renderer with fund branding
- Per-LP allocation based on pro-rata commitments
- Send workflow with email delivery and read tracking

### Data Room
- Vercel Blob storage with signed URLs (15-minute expiry)
- Per-LP access grants (zero-trust)
- Full audit log: every view and download recorded

### Security Requirements
- LP PII never sent to AI Gateway prompts
- Separate auth context from internal team
- All document URLs use signed URLs with short expiry

## Acceptance Criteria

- LP can sign in and see only their fund's data
- AI quarterly report generates coherent, professional narrative
- Capital call/distribution PDFs generate correctly per-LP
- Waterfall charts accurately visualize return distribution
- Data room documents accessible only to authorized LPs
- Every document access audited with timestamp, LP ID, IP

---

# Spec 7: Contact CRM & Network Graph

**Module:** contact-crm | **Effort:** 7 days | **Dependencies:** Specs 1, 2 | **Phase:** 3

## Objective

Contact relationship management with network graph visualization, warm intro path finding, contact enrichment, and AI relationship suggestions.

## Key Features

### Relationship Scoring
```
score = w1 * frequency_score + w2 * recency_score + w3 * depth_score
```
- Frequency: interaction count in trailing 90 days (normalized 0-1)
- Recency: inverse decay from last interaction date
- Depth: weighted sum of interaction types (meeting > call > email > note)

### Network Graph (@xyflow/react)
- Clustered layout (group by company/sector) — NOT force-directed for 1000+ contacts
- Ego-network view (centered on selected contact)
- Nodes sized by relationship score, colored by cluster
- Click to navigate, find intro path

### Warm Intro Path Finder
```sql
WITH RECURSIVE intro_path AS (
  SELECT contact_b_id AS current_contact,
    ARRAY[source_id, contact_b_id] AS path, 1 AS depth
  FROM contact_connections WHERE contact_a_id = :source_id
  UNION ALL
  SELECT cc.contact_b_id, ip.path || cc.contact_b_id, ip.depth + 1
  FROM intro_path ip JOIN contact_connections cc ON cc.contact_a_id = ip.current_contact
  WHERE ip.depth < 3 AND cc.contact_b_id != ALL(ip.path)
)
SELECT path, depth FROM intro_path
WHERE current_contact = :target_id ORDER BY depth ASC;
```

### Auto-Enrichment
- LinkedIn API + Crunchbase API (rate-limited)
- Enriched: current company, title, bio, photo, funding history

### AI Relationship Suggestions
- Nightly cron: detect job changes, funding events, internal signals
- Generate: "You should reconnect with [contact] — they moved to [relevant company]"

### Contact De-duplication
- Fuzzy matching: Levenshtein distance (name) + Jaccard similarity (email domain) + exact match (LinkedIn URL)
- AI confirmation: auto-merge at confidence > 0.95, human review otherwise

## Acceptance Criteria

- Contacts searchable with sub-200ms response for 10K contacts
- Network graph renders 500 nodes at 60fps
- Warm intro path found in < 500ms for 3-degree search in 10K network
- AI suggestions generated nightly, appear by 9am
- Duplicate detection precision > 0.90, recall > 0.85

---

# Spec 8: Meeting & Document AI

**Module:** meeting-document-ai | **Effort:** 7 days | **Dependencies:** Specs 2, 3 | **Phase:** 4

## Objective

Meeting notes with AI summarization, pitch deck analysis, document semantic search (RAG), and automatic entity linking.

## Key Features

### Meeting Note Summarization
Structured output:
```typescript
{
  key_points: string[],
  action_items: { task: string, assignee: string, due_date?: string }[],
  decisions: string[],
  follow_ups: string[]
}
```

### Pitch Deck Analysis
Extract: company name, sector, team, metrics (ARR/MRR/growth/burn), market size (TAM/SAM/SOM), business model, ask amount, use of funds.

### RAG Pipeline

1. Upload PDF → Vercel Blob
2. Extract text (Gemini Flash multimodal for image-heavy decks)
3. Chunk into ~500 token overlapping segments (50-token overlap)
4. Embed via AI SDK `embed()` → store in pgvector
5. Query: embed question → cosine similarity top-5 → LLM answer with citations

### Document Storage
- Vercel Blob with signed URLs (1-hour expiry)
- Support: PDF, PPTX, DOCX, TXT, PNG, JPG

### Auto-Linking
- NER on document content → extract company names, person names, deal references
- Match against existing entities with fuzzy search
- Auto-link at confidence > 0.9, suggest otherwise

### Data Model Additions
- `documents`, `document_chunks` (with pgvector embedding)
- `meeting_notes`, `pitch_deck_analyses`
- `document_links`, `document_versions`

## Acceptance Criteria

- Meeting summaries generated < 10 seconds for 5K-word notes
- Action item extraction accuracy > 85%
- Pitch deck analysis extracts company name > 95% accuracy
- Semantic search MRR > 0.7
- RAG hallucination rate < 5%
- Document chunking + embedding < 30 seconds for 50 pages

---

# Spec 9: Team Workspace & IC Flow

**Module:** team-workspace | **Effort:** 7 days | **Dependencies:** Specs 1, 2 | **Phase:** 4

## Objective

Team collaboration: task management, Investment Committee workflow, AI-prioritized notifications, activity feed, and automated briefings.

## Key Features

### Task Board
- Kanban with dnd-kit: To Do / In Progress / Blocked / Done
- Personal + Team views
- One-click task creation from meeting action items
- Due date reminders (1 day before + on due date)

### IC Meeting Workflow

1. **Schedule** — Pick date, add deals to agenda
2. **Pre-IC Briefing** (DurableAgent) — Per-deal briefing package:
   - Executive summary (3-5 sentences)
   - Key metrics table
   - Recent activity timeline
   - Risk factors + open questions
   - AI recommendation with rationale
3. **Voting** — Approve / Reject / Table / Request More Info
   - Synchronous (during meeting) + Asynchronous (within configurable window)
   - Anonymous voting option
4. **Decision Record** — Immutable after finalization:
   - Vote tally, final decision (majority/unanimous/supermajority)
   - Conditions, follow-up tasks, rationale

### Notification Center
- Types: task-assigned, task-due, ic-scheduled, ic-vote-requested, deal-stage-changed, ai-suggestion, system-alert
- AI prioritization: urgent (action within 24h) vs informational
- Per-user preferences: in-app, email, both, or muted

### Activity Feed
- Chronological stream of all entity changes
- Real-time via SSE (< 3 second delay)
- Filters: entity type, actor, date range

### AI Briefings
- **Daily Briefing** (cron 8am per timezone): yesterday's highlights, tasks due, upcoming IC, pipeline changes
- **Weekly Digest** (Monday 7am): portfolio KPIs, funnel changes, IC decisions, upcoming agenda

### Data Model Additions
- `tasks` — with assignee, priority, status, linked entities
- `ic_meetings`, `ic_agenda_items`, `ic_votes`, `ic_decision_records`
- `notifications`, `notification_preferences`
- `activity_events`, `briefings`

## Acceptance Criteria

- Task drag-and-drop updates status within 200ms
- IC briefing generation < 2 minutes for 5-item agenda
- Decision records immutable after finalization
- Notification prioritization > 90% accuracy
- Activity feed real-time delay < 3 seconds
- Daily briefing delivered by 8:15am
- Weekly digest sent by 7:30am Monday
- All data fund-scoped via RLS

---

# Appendix: Cross-Module Interaction Graph

| Trigger | Effects |
|---------|---------|
| Deal stage change | Health score recalc, activity feed update, notification to lead partner, Kanban refresh |
| CompanyMetric insert | Health score recalc, anomaly check (Queue), dashboard cache invalidation, LP report data refresh |
| IC Decision | Deal stage auto-update, task creation for follow-up, notification to team, audit log |
| Memo published | Document link to deal, notification to partners, activity feed, audit log |

# Appendix: Error Propagation

| Failure | Handling |
|---------|----------|
| AI Gateway failure | Fallback to cached response or graceful "AI unavailable" message. Never block CRUD. |
| Neon connection failure | Drizzle retry with exponential backoff (3 attempts). Show cached dashboard data from Redis. |
| Vercel Blob upload failure | Retry once, then show error with "save as draft" option. |
| Queue consumer failure | Vercel Queues auto-retry with backoff. Dead letter after 3 failures. Alert ops. |
