---
spec: 2
title: "Data Model & API"
module: data-model-api
status: draft
date: 2026-03-20
dependencies: [1]
estimated_effort: "7 days"
---

# Spec 2: Data Model & API

## Objective

Design and implement the complete Neon Postgres data model with Drizzle ORM, covering 16 core entities plus junction tables, with Row-Level Security for multi-tenant isolation, pgvector columns for semantic search, validated REST API routes, and a repository-pattern data access layer.

## User Stories

- As a **developer**, I want a well-structured database schema with Drizzle ORM migrations, so that the data layer is type-safe and easy to evolve.
- As a **fund admin**, I want all data automatically scoped to my organization, so that there is zero risk of cross-tenant data leakage.
- As an **associate**, I want to search companies and contacts using natural language queries, so that I can find relevant records without remembering exact names or filters.
- As a **frontend developer**, I want consistent, validated API endpoints for all entities, so that I can build UI features against a predictable contract.
- As a **partner**, I want a full audit log of data changes, so that I can track who modified deal information and when.
- As a **new team member**, I want to explore the platform with realistic demo data, so that I can understand the system's capabilities before entering real data.

## Functional Requirements

- [ ] Configure Neon Postgres connection with connection pooling via `@neondatabase/serverless`
- [ ] Set up Drizzle ORM with schema definitions, migration generation, and `drizzle-kit` CLI
- [ ] Define all 16 core entity tables with appropriate column types, defaults, and constraints
- [ ] Define junction tables for many-to-many relationships (deal-tags, contact-companies, fund-lps, etc.)
- [ ] Implement Row-Level Security (RLS) policies on all tenant-scoped tables using `org_id`
- [ ] Add `pgvector` extension and vector columns (1536 dimensions) on Company and Contact tables
- [ ] Create database indexes for foreign keys, frequently queried columns, and vector similarity search
- [ ] Build Zod validation schemas for every entity's create and update operations
- [ ] Implement repository pattern with standard interface: `findAll`, `findById`, `create`, `update`, `delete`, `search`
- [ ] Build REST API route handlers (Next.js Route Handlers) for all entities with full CRUD
- [ ] Wrap all API responses in a consistent envelope: `{ success, data, error, meta }`
- [ ] Add pagination support (`page`, `limit`, `total`) to all list endpoints
- [ ] Add filtering, sorting, and field selection query parameters to list endpoints
- [ ] Implement soft delete (archived_at timestamp) on entities that support it
- [ ] Create seed script with realistic demo data spanning all entities
- [ ] Write database migration files that are idempotent and reversible

## Technical Design

### Components

```
src/
  lib/
    db/
      index.ts                   # Neon/Drizzle client initialization
      schema/
        index.ts                 # Re-exports all schemas
        organization.ts          # Organization table
        fund.ts                  # Fund table
        company.ts               # Company table + pgvector column
        deal.ts                  # Deal table
        round.ts                 # Round (funding round) table
        investment.ts            # Investment table
        contact.ts               # Contact table + pgvector column
        lp.ts                    # LP (Limited Partner) table
        investment-memo.ts       # Investment memo table
        company-metric.ts        # Company metric (KPI tracking) table
        report.ts                # Report table
        meeting.ts               # Meeting table
        task.ts                  # Task table
        ic-decision.ts           # IC (Investment Committee) decision table
        tag.ts                   # Tag table
        audit-log.ts             # Audit log table
        junctions.ts             # All junction/join tables
        enums.ts                 # Shared enum definitions
      migrations/                # Drizzle-generated migration SQL files
      seed.ts                    # Demo data seed script
      rls.ts                     # Row-Level Security policy definitions
    repositories/
      base.repository.ts         # Abstract base repository with common CRUD
      organization.repository.ts
      fund.repository.ts
      company.repository.ts
      deal.repository.ts
      round.repository.ts
      investment.repository.ts
      contact.repository.ts
      lp.repository.ts
      investment-memo.repository.ts
      company-metric.repository.ts
      report.repository.ts
      meeting.repository.ts
      task.repository.ts
      ic-decision.repository.ts
      tag.repository.ts
      audit-log.repository.ts
    validation/
      schemas/
        organization.schema.ts   # Zod schemas for Organization
        fund.schema.ts
        company.schema.ts
        deal.schema.ts
        round.schema.ts
        investment.schema.ts
        contact.schema.ts
        lp.schema.ts
        investment-memo.schema.ts
        company-metric.schema.ts
        report.schema.ts
        meeting.schema.ts
        task.schema.ts
        ic-decision.schema.ts
        tag.schema.ts
      index.ts                   # Re-exports all schemas
    api/
      response.ts                # API response envelope helper
      pagination.ts              # Pagination utilities
      error-handler.ts           # Centralized API error handling
  app/
    api/
      v1/
        organizations/route.ts
        funds/route.ts
        companies/route.ts
        deals/route.ts
        rounds/route.ts
        investments/route.ts
        contacts/route.ts
        lps/route.ts
        investment-memos/route.ts
        company-metrics/route.ts
        reports/route.ts
        meetings/route.ts
        tasks/route.ts
        ic-decisions/route.ts
        tags/route.ts
        audit-logs/route.ts
        search/route.ts          # Semantic search endpoint
```

### Data Model

#### Core Entities

**1. Organization**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| clerk_org_id | varchar(255) | unique, not null |
| name | varchar(255) | not null |
| slug | varchar(100) | unique, not null |
| logo_url | text | nullable |
| website | text | nullable |
| plan | enum('free','pro','enterprise') | default 'free' |
| settings | jsonb | default '{}' |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**2. Fund**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| name | varchar(255) | not null |
| description | text | nullable |
| vintage_year | integer | not null |
| target_size_usd | bigint | not null |
| committed_capital_usd | bigint | default 0 |
| deployed_capital_usd | bigint | default 0 |
| currency | varchar(3) | default 'USD' |
| status | enum('raising','active','fully_deployed','harvesting','closed') | default 'active' |
| thesis | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**3. Company**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| name | varchar(255) | not null |
| legal_name | varchar(255) | nullable |
| domain | varchar(255) | nullable |
| description | text | nullable |
| sector | varchar(100) | nullable |
| sub_sector | varchar(100) | nullable |
| stage | enum('pre_seed','seed','series_a','series_b','series_c','growth','public') | nullable |
| founded_year | integer | nullable |
| hq_city | varchar(100) | nullable |
| hq_country | varchar(100) | nullable |
| employee_count | integer | nullable |
| website | text | nullable |
| linkedin_url | text | nullable |
| logo_url | text | nullable |
| embedding | vector(1536) | nullable, pgvector |
| archived_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**4. Deal**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| fund_id | uuid | FK -> Fund, nullable |
| company_id | uuid | FK -> Company, not null |
| title | varchar(255) | not null |
| stage | enum('sourced','screening','due_diligence','ic_review','term_sheet','closed_won','closed_lost','passed') | default 'sourced' |
| source | varchar(100) | nullable |
| source_detail | text | nullable |
| lead_partner_id | varchar(255) | nullable (Clerk user ID) |
| assigned_to | varchar(255) | nullable (Clerk user ID) |
| priority | enum('low','medium','high','urgent') | default 'medium' |
| expected_close_date | date | nullable |
| notes | text | nullable |
| ai_score | jsonb | nullable |
| archived_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**5. Round**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| company_id | uuid | FK -> Company, not null |
| deal_id | uuid | FK -> Deal, nullable |
| round_type | enum('pre_seed','seed','series_a','series_b','series_c','series_d','growth','bridge','convertible_note','safe') | not null |
| target_raise_usd | bigint | nullable |
| total_raised_usd | bigint | nullable |
| pre_money_valuation_usd | bigint | nullable |
| post_money_valuation_usd | bigint | nullable |
| lead_investor | varchar(255) | nullable |
| announced_date | date | nullable |
| closed_date | date | nullable |
| status | enum('open','closed','cancelled') | default 'open' |
| terms | jsonb | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**6. Investment**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| fund_id | uuid | FK -> Fund, not null |
| deal_id | uuid | FK -> Deal, not null |
| round_id | uuid | FK -> Round, nullable |
| company_id | uuid | FK -> Company, not null |
| amount_usd | bigint | not null |
| ownership_percentage | decimal(5,2) | nullable |
| instrument | enum('equity','safe','convertible_note','warrant') | not null |
| investment_date | date | not null |
| board_seat | boolean | default false |
| status | enum('committed','funded','written_off','exited') | default 'committed' |
| current_valuation_usd | bigint | nullable |
| moic | decimal(6,2) | nullable |
| irr | decimal(6,2) | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**7. Contact**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| first_name | varchar(100) | not null |
| last_name | varchar(100) | not null |
| email | varchar(255) | nullable |
| phone | varchar(50) | nullable |
| title | varchar(255) | nullable |
| linkedin_url | text | nullable |
| twitter_handle | varchar(100) | nullable |
| type | enum('founder','executive','investor','advisor','lp','other') | default 'other' |
| notes | text | nullable |
| avatar_url | text | nullable |
| embedding | vector(1536) | nullable, pgvector |
| archived_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**8. LP (Limited Partner)**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| contact_id | uuid | FK -> Contact, nullable |
| name | varchar(255) | not null |
| type | enum('individual','family_office','institution','fund_of_funds','endowment','pension','sovereign_wealth','corporate') | not null |
| committed_capital_usd | bigint | default 0 |
| called_capital_usd | bigint | default 0 |
| distributed_capital_usd | bigint | default 0 |
| clerk_user_id | varchar(255) | nullable |
| status | enum('prospect','committed','active','inactive') | default 'prospect' |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**9. InvestmentMemo**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| deal_id | uuid | FK -> Deal, not null |
| author_id | varchar(255) | not null (Clerk user ID) |
| title | varchar(255) | not null |
| content | text | not null |
| memo_type | enum('initial_screening','deep_dive','ic_memo','follow_on','exit') | not null |
| status | enum('draft','review','approved','rejected') | default 'draft' |
| ai_summary | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**10. CompanyMetric**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| company_id | uuid | FK -> Company, not null |
| metric_name | varchar(100) | not null |
| metric_value | decimal(18,4) | not null |
| metric_unit | varchar(50) | nullable |
| period_start | date | not null |
| period_end | date | not null |
| period_type | enum('monthly','quarterly','annually') | not null |
| source | enum('self_reported','calculated','external') | default 'self_reported' |
| notes | text | nullable |
| created_at | timestamptz | default now() |

**11. Report**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| fund_id | uuid | FK -> Fund, nullable |
| title | varchar(255) | not null |
| report_type | enum('quarterly_update','annual_review','lp_report','ad_hoc','portfolio_summary') | not null |
| content | text | nullable |
| generated_by | enum('manual','ai') | default 'manual' |
| period_start | date | nullable |
| period_end | date | nullable |
| status | enum('draft','review','published') | default 'draft' |
| published_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**12. Meeting**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| deal_id | uuid | FK -> Deal, nullable |
| company_id | uuid | FK -> Company, nullable |
| title | varchar(255) | not null |
| description | text | nullable |
| meeting_type | enum('intro_call','pitch','follow_up','due_diligence','ic_meeting','board','other') | not null |
| scheduled_at | timestamptz | not null |
| duration_minutes | integer | default 30 |
| location | text | nullable |
| meeting_url | text | nullable |
| notes | text | nullable |
| ai_summary | text | nullable |
| status | enum('scheduled','completed','cancelled','no_show') | default 'scheduled' |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**13. Task**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| deal_id | uuid | FK -> Deal, nullable |
| company_id | uuid | FK -> Company, nullable |
| title | varchar(255) | not null |
| description | text | nullable |
| assigned_to | varchar(255) | nullable (Clerk user ID) |
| created_by | varchar(255) | not null (Clerk user ID) |
| priority | enum('low','medium','high','urgent') | default 'medium' |
| status | enum('todo','in_progress','done','cancelled') | default 'todo' |
| due_date | date | nullable |
| completed_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**14. ICDecision**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| deal_id | uuid | FK -> Deal, not null |
| meeting_id | uuid | FK -> Meeting, nullable |
| decision | enum('approved','rejected','tabled','more_info_needed') | not null |
| vote_summary | jsonb | not null |
| conditions | text | nullable |
| rationale | text | nullable |
| decided_at | timestamptz | not null |
| created_at | timestamptz | default now() |

**15. Tag**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| name | varchar(100) | not null |
| color | varchar(7) | default '#6366f1' |
| category | enum('sector','geography','stage','strategy','custom') | default 'custom' |
| created_at | timestamptz | default now() |

Unique constraint on (org_id, name).

**16. AuditLog**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| org_id | uuid | FK -> Organization, not null |
| user_id | varchar(255) | not null (Clerk user ID) |
| entity_type | varchar(50) | not null |
| entity_id | uuid | not null |
| action | enum('create','update','delete','archive','restore','stage_change') | not null |
| changes | jsonb | nullable |
| ip_address | inet | nullable |
| user_agent | text | nullable |
| created_at | timestamptz | default now() |

No updated_at -- audit logs are immutable.

#### Junction Tables

| Table | Columns | Purpose |
|-------|---------|---------|
| deal_tags | deal_id (FK), tag_id (FK) | Many-to-many deals-tags |
| company_tags | company_id (FK), tag_id (FK) | Many-to-many companies-tags |
| contact_companies | contact_id (FK), company_id (FK), role varchar, is_primary boolean | Contact-company associations |
| fund_lps | fund_id (FK), lp_id (FK), commitment_usd bigint, commitment_date date | LP commitments to funds |
| meeting_attendees | meeting_id (FK), contact_id (FK), user_id varchar, rsvp_status enum | Meeting participants |
| deal_contacts | deal_id (FK), contact_id (FK), role varchar | Contacts involved in a deal |
| deal_stage_history | id uuid PK, deal_id (FK), from_stage enum, to_stage enum, changed_by varchar, changed_at timestamptz, duration_hours integer, notes text | Deal stage transition log |

### API Endpoints

All endpoints are prefixed with `/api/v1/` and require authentication. The `org_id` is extracted from the Clerk session context automatically.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/organizations` | List orgs for current user |
| GET | `/api/v1/organizations/:id` | Get org details |
| PATCH | `/api/v1/organizations/:id` | Update org settings |
| GET | `/api/v1/funds` | List funds in current org |
| POST | `/api/v1/funds` | Create fund |
| GET | `/api/v1/funds/:id` | Get fund details |
| PATCH | `/api/v1/funds/:id` | Update fund |
| DELETE | `/api/v1/funds/:id` | Soft delete fund |
| GET | `/api/v1/companies` | List companies (paginated, filterable) |
| POST | `/api/v1/companies` | Create company |
| GET | `/api/v1/companies/:id` | Get company with relations |
| PATCH | `/api/v1/companies/:id` | Update company |
| DELETE | `/api/v1/companies/:id` | Archive company |
| GET | `/api/v1/deals` | List deals (paginated, filterable, sortable) |
| POST | `/api/v1/deals` | Create deal |
| GET | `/api/v1/deals/:id` | Get deal with full relations |
| PATCH | `/api/v1/deals/:id` | Update deal |
| PATCH | `/api/v1/deals/:id/stage` | Update deal stage (triggers history logging) |
| DELETE | `/api/v1/deals/:id` | Archive deal |
| GET | `/api/v1/rounds` | List rounds |
| POST | `/api/v1/rounds` | Create round |
| GET | `/api/v1/rounds/:id` | Get round details |
| PATCH | `/api/v1/rounds/:id` | Update round |
| GET | `/api/v1/investments` | List investments |
| POST | `/api/v1/investments` | Create investment |
| GET | `/api/v1/investments/:id` | Get investment details |
| PATCH | `/api/v1/investments/:id` | Update investment |
| GET | `/api/v1/contacts` | List contacts (paginated, filterable) |
| POST | `/api/v1/contacts` | Create contact |
| GET | `/api/v1/contacts/:id` | Get contact with associations |
| PATCH | `/api/v1/contacts/:id` | Update contact |
| DELETE | `/api/v1/contacts/:id` | Archive contact |
| GET | `/api/v1/lps` | List LPs |
| POST | `/api/v1/lps` | Create LP |
| GET | `/api/v1/lps/:id` | Get LP details |
| PATCH | `/api/v1/lps/:id` | Update LP |
| GET | `/api/v1/investment-memos` | List memos (filterable by deal) |
| POST | `/api/v1/investment-memos` | Create memo |
| GET | `/api/v1/investment-memos/:id` | Get memo |
| PATCH | `/api/v1/investment-memos/:id` | Update memo |
| GET | `/api/v1/company-metrics` | List metrics (filterable by company, period) |
| POST | `/api/v1/company-metrics` | Create metric entry |
| GET | `/api/v1/reports` | List reports |
| POST | `/api/v1/reports` | Create report |
| GET | `/api/v1/reports/:id` | Get report |
| PATCH | `/api/v1/reports/:id` | Update report |
| GET | `/api/v1/meetings` | List meetings |
| POST | `/api/v1/meetings` | Create meeting |
| GET | `/api/v1/meetings/:id` | Get meeting with attendees |
| PATCH | `/api/v1/meetings/:id` | Update meeting |
| GET | `/api/v1/tasks` | List tasks (filterable by assignee, deal, status) |
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks/:id` | Get task |
| PATCH | `/api/v1/tasks/:id` | Update task |
| GET | `/api/v1/ic-decisions` | List IC decisions (filterable by deal) |
| POST | `/api/v1/ic-decisions` | Create IC decision |
| GET | `/api/v1/tags` | List tags in org |
| POST | `/api/v1/tags` | Create tag |
| PATCH | `/api/v1/tags/:id` | Update tag |
| DELETE | `/api/v1/tags/:id` | Delete tag |
| GET | `/api/v1/audit-logs` | List audit logs (filterable, read-only) |
| POST | `/api/v1/search` | Semantic search across entities |

**Response Envelope Format:**

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

**Query Parameters (list endpoints):**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 25, max: 100) |
| sort | string | Sort field (e.g., `created_at`) |
| order | 'asc' \| 'desc' | Sort direction (default: desc) |
| search | string | Full-text search query |
| fields | string | Comma-separated field selection |
| filter[field] | string | Field-specific filters |

### AI Integration

- **Embedding Generation**: When a Company or Contact is created or updated, generate a 1536-dimension embedding from the entity's text fields (name, description, sector, notes) using OpenAI `text-embedding-3-small` and store it in the `embedding` column.
- **Semantic Search Endpoint**: The `/api/v1/search` endpoint accepts a natural language query, generates an embedding, and performs cosine similarity search across Company and Contact tables using pgvector's `<=>` operator. Results are ranked by similarity score and merged across entity types.
- **Audit Log Automation**: All create, update, delete, and stage-change operations automatically write to the AuditLog table via repository middleware, capturing the diff of changed fields.

## UI/UX

This spec is primarily backend-focused. The API is consumed by the UI components defined in Specs 1 and 3. Key developer-facing UX:

- **Drizzle Studio**: Accessible via `pnpm db:studio` for database inspection during development.
- **API Documentation**: Auto-generated OpenAPI spec from Zod schemas, viewable at `/api/docs` in development mode.
- **Seed Data**: Running `pnpm db:seed` populates the database with 2 organizations, 3 funds, 50 companies, 80 deals, 200 contacts, and related records across all entities. This provides a realistic dataset for UI development and demos.

## Acceptance Criteria

- [ ] `pnpm db:generate` produces migration SQL without errors
- [ ] `pnpm db:migrate` applies all migrations to a clean Neon Postgres database successfully
- [ ] All 16 entity tables and junction tables exist with correct columns, types, and constraints
- [ ] RLS policies are active: a query with `org_id = X` returns zero rows from `org_id = Y`
- [ ] pgvector extension is enabled; vector columns accept 1536-dimension embeddings
- [ ] Every entity has a corresponding Zod create schema and update schema (update = partial of create)
- [ ] All API list endpoints return paginated results with the `{ success, data, error, meta }` envelope
- [ ] API endpoints validate input using Zod schemas and return 400 with descriptive errors on invalid input
- [ ] API endpoints enforce authentication (401 for unauthenticated) and authorization (403 for wrong role)
- [ ] Creating, updating, or deleting any entity produces an entry in the AuditLog table
- [ ] Semantic search endpoint returns relevant Company and Contact results for natural language queries
- [ ] `pnpm db:seed` populates all tables with demo data and completes without constraint violations
- [ ] Repository methods are unit-tested with at least 80% coverage
- [ ] No N+1 query issues on detail endpoints that include relations
- [ ] All API responses complete within 200ms for list endpoints (25 items) and 100ms for detail endpoints

## Out of Scope

- Real-time data synchronization (WebSocket/SSE) -- covered in a future spec
- File upload and document storage (S3/R2 integration)
- Background job processing (embedding generation may be synchronous initially)
- GraphQL API (REST only for v1)
- Database read replicas and advanced connection pooling optimization
- Data export (CSV/Excel download) from API endpoints
- Webhook delivery to external systems
