---
spec: 3
title: "Deal Flow Pipeline"
module: deal-flow-pipeline
status: draft
date: 2026-03-20
dependencies: [1, 2]
estimated_effort: "7 days"
---

# Spec 3: Deal Flow Pipeline

## Objective

Build a fully interactive deal flow management system with a configurable Kanban pipeline, AI-powered deal intake and scoring, batch import capabilities, email-to-deal capture, side-by-side comparison views, and pipeline analytics dashboards.

## User Stories

- As a **partner**, I want to view all active deals on a Kanban board organized by stage, so that I can see the pipeline health at a glance and prioritize my time.
- As an **associate**, I want to drag a deal card from "Screening" to "Due Diligence", so that I can update deal stages without navigating away from the pipeline view.
- As an **analyst**, I want to type "Log a new deal: Series A, fintech, $5M round" in the AI chat, so that I can capture deals quickly during calls without filling out forms.
- As a **partner**, I want AI-generated deal scores across market, team, traction, and fund fit dimensions, so that I can quickly triage a large volume of inbound deals.
- As an **associate**, I want to import a CSV of 50 deals from a conference, so that I can batch-enter pipeline data without manual data entry for each deal.
- As a **partner**, I want to compare two deals side by side with a radar chart, so that I can make informed decisions about which to advance to IC.
- As a **fund admin**, I want to see conversion rates from Sourced to Closed by quarter and by source, so that I can optimize our deal sourcing strategy.
- As an **associate**, I want to forward a pitch email to a dedicated inbox and have it automatically create a deal, so that inbound opportunities are never lost.
- As a **partner**, I want to see how long each deal has spent in its current stage, so that I can identify bottlenecks and stale deals.

## Functional Requirements

### Kanban Board
- [ ] Render a horizontal Kanban board with configurable stage columns: Sourced, Screening, Due Diligence, IC Review, Term Sheet, Closed (Won), Passed
- [ ] Allow organizations to customize stage names, order, and colors via settings
- [ ] Implement drag-and-drop between columns using @dnd-kit with smooth animations
- [ ] Display deal cards with: company name, logo, round type, amount, lead partner avatar, priority badge, days-in-stage counter, AI score indicator
- [ ] Support card quick actions: assign, set priority, add note, schedule meeting, archive
- [ ] Collapse/expand columns; show deal count and total round value per column
- [ ] Filter deals by: fund, assignee, priority, source, sector, date range, tags
- [ ] Sort within columns by: AI score, days in stage, round size, created date, priority
- [ ] Persist user's filter and sort preferences in local storage
- [ ] Show stage transition confirmation dialog with optional note field when dragging between columns

### AI Deal Intake
- [ ] Parse natural language deal descriptions from the AI chat panel into structured deal data
- [ ] Extract: company name, round type, round amount, sector, key contacts, source
- [ ] Present extracted data in a confirmation card within the chat before creating the deal
- [ ] Support follow-up clarifications: "Actually, it's Series B, not A"
- [ ] Auto-create Company and Contact records if they don't already exist (with dedup check)
- [ ] Link the created deal to the active fund context

### AI Deal Scoring
- [ ] Generate deal scores across four dimensions: Market Opportunity (0-100), Team Quality (0-100), Traction & Metrics (0-100), Fund Fit (0-100)
- [ ] Use structured output with Zod schemas to ensure consistent score format
- [ ] Compute an overall weighted score (configurable weights per organization)
- [ ] Display score breakdown on the deal detail page with visual indicators (color-coded bars)
- [ ] Allow manual score override with audit trail
- [ ] Re-score automatically when deal data is updated (company metrics, memo content, etc.)
- [ ] Store scoring rationale text alongside numeric scores for transparency

### Batch Import
- [ ] Accept CSV and Excel (.xlsx) file uploads via a drag-and-drop upload zone
- [ ] Show column mapping UI: map uploaded columns to deal/company fields
- [ ] Preview first 10 rows with validation status (green/yellow/red) per row
- [ ] Handle duplicates: match on company name + domain with fuzzy matching; show merge/skip/create options
- [ ] Run import as a background operation with progress indicator
- [ ] Generate import summary: X created, Y updated, Z skipped, W errors
- [ ] Store import history with ability to undo a batch import within 24 hours

### Email-to-Deal Capture
- [ ] Provide a unique inbound email address per organization (e.g., deals+{org_slug}@venturemind.ai)
- [ ] Parse forwarded pitch emails to extract: company name, founder name/email, round details, pitch deck URL
- [ ] Use AI to summarize the pitch email content into a deal description
- [ ] Create deal in "Sourced" stage with source = "Email Inbound"
- [ ] Attach the original email as a note on the deal record
- [ ] Send a confirmation message to the forwarder via the AI chat panel
- [ ] Handle parsing failures gracefully: create a deal with raw email content and flag for manual review

### Deal Comparison View
- [ ] Select 2-4 deals from the pipeline for side-by-side comparison
- [ ] Display a comparison table with rows: company info, round details, metrics, AI scores, stage, team
- [ ] Render a radar chart (using Recharts) overlaying AI scores for selected deals
- [ ] Highlight differences and advantages in each dimension
- [ ] Allow printing/exporting the comparison view as PDF

### Pipeline Analytics
- [ ] Conversion funnel visualization: show deal count and percentage drop at each stage transition
- [ ] Stage velocity chart: average days deals spend in each stage (bar chart, filterable by time period)
- [ ] Source attribution: pie/donut chart showing deal count and conversion rate by source
- [ ] Time-series line chart: deals sourced, closed-won, and passed per month
- [ ] Filter all analytics by: fund, date range, sector, source, assignee
- [ ] Summary KPI cards at top: Total Active Deals, Avg Days to Close, Win Rate, Total Pipeline Value
- [ ] Export analytics data as CSV

### Deal Stage History
- [ ] Record every stage transition with timestamp, user, from-stage, to-stage, duration, and optional note
- [ ] Display a timeline/activity feed on the deal detail page showing all stage changes
- [ ] Calculate and display cumulative time in each stage as a horizontal stacked bar
- [ ] Alert when a deal has been in a stage longer than the org's configured threshold (e.g., >14 days in Screening)

## Technical Design

### Components

```
src/
  app/
    (dashboard)/
      deals/
        page.tsx                    # Deal pipeline Kanban view (default)
        [id]/
          page.tsx                  # Deal detail page
        compare/
          page.tsx                  # Deal comparison view
        import/
          page.tsx                  # Batch import wizard
        analytics/
          page.tsx                  # Pipeline analytics dashboard
  components/
    deals/
      pipeline/
        kanban-board.tsx            # Main Kanban container with @dnd-kit DndContext
        kanban-column.tsx           # Single stage column (droppable)
        deal-card.tsx               # Draggable deal card
        deal-card-skeleton.tsx      # Loading skeleton for deal cards
        stage-transition-dialog.tsx # Confirmation dialog on stage change
        pipeline-filters.tsx        # Filter bar (fund, assignee, priority, etc.)
        pipeline-toolbar.tsx        # Sort, view toggle, bulk actions
      detail/
        deal-header.tsx             # Deal title, stage badge, actions
        deal-overview.tsx           # Company info, round details, key contacts
        deal-ai-score.tsx           # AI score breakdown with color bars
        deal-activity-feed.tsx      # Timeline of stage changes, notes, meetings
        deal-stage-history.tsx      # Stacked bar showing time per stage
        deal-memos.tsx              # Investment memos list
        deal-tasks.tsx              # Related tasks
        deal-meetings.tsx           # Related meetings
      comparison/
        comparison-table.tsx        # Side-by-side data table
        comparison-radar.tsx        # Radar chart overlay (Recharts)
        deal-selector.tsx           # Multi-select deal picker
      import/
        file-upload-zone.tsx        # Drag-and-drop CSV/Excel upload
        column-mapper.tsx           # Map file columns to entity fields
        import-preview.tsx          # Preview rows with validation status
        duplicate-resolver.tsx      # Handle duplicate detection
        import-progress.tsx         # Progress bar with status messages
      analytics/
        conversion-funnel.tsx       # Funnel visualization
        stage-velocity-chart.tsx    # Bar chart of avg days per stage
        source-attribution.tsx      # Donut chart by source
        deals-over-time.tsx         # Line chart of deal flow over time
        pipeline-kpi-cards.tsx      # Summary metric cards
    ai/
      deal-intake-card.tsx          # Confirmation card for AI-parsed deal
      deal-score-card.tsx           # AI score result display in chat
  lib/
    deals/
      deal-intake-parser.ts         # AI prompt + Zod schema for parsing NL deal input
      deal-scorer.ts                # AI prompt + Zod schema for deal scoring
      deal-import.ts                # CSV/Excel parsing and validation logic
      email-parser.ts               # Email-to-deal parsing logic
      pipeline-analytics.ts         # Analytics query builders and aggregations
      stage-config.ts               # Default and custom stage configurations
  app/
    api/
      v1/
        deals/
          import/route.ts           # Batch import endpoint
          compare/route.ts          # Comparison data endpoint
          analytics/route.ts        # Analytics aggregation endpoint
        inbound-email/route.ts      # Email-to-deal webhook endpoint
        ai/
          deal-intake/route.ts      # AI deal parsing endpoint
          deal-score/route.ts       # AI deal scoring endpoint
```

### Data Model

This module primarily uses entities from Spec 2. Additional structures:

**Deal AI Score (stored as JSONB in `deal.ai_score`):**

```typescript
const DealAIScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  dimensions: z.object({
    market_opportunity: z.object({
      score: z.number().min(0).max(100),
      rationale: z.string(),
    }),
    team_quality: z.object({
      score: z.number().min(0).max(100),
      rationale: z.string(),
    }),
    traction_metrics: z.object({
      score: z.number().min(0).max(100),
      rationale: z.string(),
    }),
    fund_fit: z.object({
      score: z.number().min(0).max(100),
      rationale: z.string(),
    }),
  }),
  weights: z.object({
    market_opportunity: z.number(),
    team_quality: z.number(),
    traction_metrics: z.number(),
    fund_fit: z.number(),
  }),
  scored_at: z.string().datetime(),
  model_version: z.string(),
});
```

**Deal Intake Parsed Result:**

```typescript
const DealIntakeSchema = z.object({
  company_name: z.string(),
  round_type: z.enum(['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth', 'bridge']),
  round_amount_usd: z.number().nullable(),
  sector: z.string().nullable(),
  sub_sector: z.string().nullable(),
  source: z.string().nullable(),
  contacts: z.array(z.object({
    name: z.string(),
    email: z.string().email().nullable(),
    title: z.string().nullable(),
    role: z.enum(['founder', 'executive', 'investor', 'advisor']),
  })).default([]),
  description: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});
```

**Stage Configuration (stored in `organization.settings` JSONB):**

```typescript
const StageConfigSchema = z.object({
  stages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    order: z.number(),
    sla_days: z.number().nullable(),
    is_terminal: z.boolean().default(false),
  })),
  weights: z.object({
    market_opportunity: z.number().default(0.3),
    team_quality: z.number().default(0.3),
    traction_metrics: z.number().default(0.25),
    fund_fit: z.number().default(0.15),
  }),
});
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/deals/import` | Upload and process CSV/Excel batch import |
| GET | `/api/v1/deals/import/:id` | Get import job status and results |
| POST | `/api/v1/deals/import/:id/undo` | Undo a batch import (within 24h) |
| GET | `/api/v1/deals/compare?ids=a,b,c` | Get comparison data for selected deals |
| GET | `/api/v1/deals/analytics/funnel` | Conversion funnel data |
| GET | `/api/v1/deals/analytics/velocity` | Stage velocity metrics |
| GET | `/api/v1/deals/analytics/sources` | Source attribution breakdown |
| GET | `/api/v1/deals/analytics/timeline` | Deals over time series data |
| GET | `/api/v1/deals/analytics/kpis` | Summary KPI metrics |
| POST | `/api/v1/inbound-email` | Webhook for inbound email processing |
| POST | `/api/v1/ai/deal-intake` | Parse natural language into deal data |
| POST | `/api/v1/ai/deal-score` | Generate AI scores for a deal |
| POST | `/api/v1/ai/deal-score/batch` | Score multiple deals in batch |

### AI Integration

**Deal Intake via Chat:**
- The AI chat panel routes deal-related intents to the `/api/v1/ai/deal-intake` endpoint.
- The endpoint uses a system prompt instructing the model to extract structured deal data from conversational input.
- Zod structured output ensures the response conforms to `DealIntakeSchema`.
- The confirmation card in the chat lets the user review, edit fields inline, and confirm before the deal is persisted.
- Entity deduplication: before creating, search existing companies by name and domain using fuzzy matching (Levenshtein distance < 3 or domain match). Present merge options if duplicates found.

**AI Deal Scoring:**
- When triggered (manually or on deal update), the scoring endpoint gathers all available context: company info, round details, company metrics, investment memo content, meeting notes, and fund thesis.
- The system prompt instructs the model to evaluate four dimensions with 0-100 scores and written rationale.
- Zod structured output ensures conformance to `DealAIScoreSchema`.
- Scores are stored in the deal's `ai_score` JSONB column and trigger an AuditLog entry.
- The model version is recorded for reproducibility and score comparison across model updates.

**Email Parsing:**
- Inbound emails are received via webhook from the email provider (e.g., SendGrid Inbound Parse or Postmark).
- The raw email body is sent to the AI with a prompt to extract company name, founder details, round info, and a summary.
- Parsing confidence below 0.6 triggers a "needs review" flag on the created deal.

## UI/UX

### Kanban Board (Primary Pipeline View)

- **Layout**: Full-width horizontal scroll with stage columns. Each column has a colored header bar matching the stage color.
- **Column Header**: Stage name, deal count badge, total pipeline value, collapse/expand toggle.
- **Deal Cards** (280px wide):
  - Company logo (40x40, fallback to initials avatar) + company name (bold)
  - Round badge (e.g., "Series A") + amount ("$5M")
  - Lead partner avatar (24x24) + name
  - Priority indicator (colored left border: blue=low, yellow=medium, orange=high, red=urgent)
  - Days-in-stage counter with color coding: green (<7d), yellow (7-14d), red (>14d, configurable)
  - AI score mini-indicator: small circular progress ring with overall score
  - Quick action dots menu on hover: Assign, Priority, Note, Meeting, Archive
- **Drag Behavior**: Ghost card follows cursor with reduced opacity. Drop zones highlight on hover. Animated card insertion with spring physics. Stage change confirmation dialog appears after drop.
- **Empty State**: Illustration + "No deals in this stage" + "Create deal" button or "Drag deals here".

### Deal Detail Page

- **Header**: Company logo + name, current stage badge (colored), AI overall score ring, action buttons (Edit, Score, Archive).
- **Tab Navigation**: Overview | Memos | Meetings | Tasks | History.
- **Overview Tab**:
  - Two-column layout: left = deal info cards, right = AI score breakdown.
  - Company info card: name, sector, stage, founding year, location, employee count, website link.
  - Round info card: type, target raise, valuation, lead investor, status.
  - Contacts card: key people with role badges, LinkedIn links.
  - Tags: editable tag chips with add button.
- **AI Score Section**: Four horizontal bars (Market, Team, Traction, Fit) with score numbers and brief rationale text. "Re-score" button. Score history chart showing score changes over time.
- **History Tab**: Vertical timeline with stage transitions (colored dots), notes, meetings, and memo entries interleaved chronologically.

### Deal Comparison View

- Accessed via "Compare" button after selecting 2-4 deals (checkbox on deal cards).
- **Top section**: Radar chart (Recharts RadarChart) with each deal as a colored polygon overlay.
- **Bottom section**: Comparison table with sticky first column (field names) and scrollable deal columns. Alternating row colors. Best-in-class values highlighted in green.
- **Fields compared**: Company name, sector, stage, round size, valuation, AI scores (all 4 dimensions + overall), days in pipeline, source, lead partner.

### Batch Import Wizard

Four-step wizard flow with step indicator:

1. **Upload**: Drag-and-drop zone accepting .csv and .xlsx files. File size limit: 10MB. Sample template download link.
2. **Map Columns**: Two-column layout. Left = uploaded column headers. Right = dropdown selectors for target fields. Auto-mapping for common column names. Required fields highlighted.
3. **Preview & Validate**: Table showing first 10 rows. Row status icons: green checkmark (valid), yellow warning (minor issues), red X (invalid). Click row to see error details. Summary bar: "45 valid, 3 warnings, 2 errors".
4. **Import**: Progress bar with percentage. Real-time log of created/updated/skipped records. Completion summary with "Undo Import" button.

### Pipeline Analytics Dashboard

- **Top Row**: Four KPI cards: Total Active Deals (number + trend arrow), Avg Days to Close (number), Pipeline Win Rate (percentage + trend), Total Pipeline Value (dollar amount).
- **Second Row**: Conversion funnel (horizontal, showing count and percentage at each stage transition) spanning full width.
- **Third Row**: Two charts side by side:
  - Left: Stage velocity bar chart (avg days per stage, one bar per stage).
  - Right: Source attribution donut chart with legend and percentage labels.
- **Fourth Row**: Deals over time line chart (full width) with three lines: Sourced, Closed Won, Passed. Date range selector with presets (This Quarter, Last Quarter, YTD, Last 12 Months, Custom).
- **Global Filters**: Fund selector, date range picker, sector multi-select, assignee multi-select. Applied filters shown as removable chips.

## Acceptance Criteria

- [ ] Kanban board renders all deal stages as columns with correct deal cards
- [ ] Dragging a deal card between columns updates the deal stage in the database and records a stage history entry
- [ ] Stage transition confirmation dialog appears and allows adding a note
- [ ] Pipeline filters (fund, assignee, priority, source, sector, tags) correctly filter displayed deals
- [ ] AI chat input "Log a new deal: Series A, fintech, $5M round" produces a correctly parsed confirmation card
- [ ] Confirming the AI-parsed deal creates Deal, Company, and Contact records with correct data
- [ ] AI deal scoring returns scores for all four dimensions with rationale text
- [ ] Scores conform to the Zod schema and are stored in the deal's ai_score column
- [ ] CSV import with 50 rows completes successfully, creating/updating correct records
- [ ] Duplicate detection during import identifies existing companies and offers merge/skip/create options
- [ ] Import undo within 24 hours removes all records created by that import batch
- [ ] Forwarded email to the org's inbound address creates a deal in "Sourced" stage with extracted data
- [ ] Deal comparison radar chart renders correctly for 2-4 selected deals
- [ ] Pipeline analytics funnel shows accurate conversion percentages matching actual deal data
- [ ] Stage velocity chart reflects correct average days calculated from deal_stage_history records
- [ ] Source attribution chart matches deal source distribution in the database
- [ ] Stale deal alerts appear for deals exceeding the configured SLA threshold per stage
- [ ] All drag-and-drop interactions work smoothly without UI glitches (no flickering, correct drop targets)
- [ ] Pipeline page loads in under 2 seconds with 200+ active deals

## Out of Scope

- Automated deal sourcing from external databases (Crunchbase, PitchBook integration)
- LP portal with deal co-investment features
- Document management (pitch deck storage, data room)
- Automated due diligence checklist generation
- Integration with external CRM systems (Salesforce, HubSpot sync)
- Mobile/tablet-optimized Kanban view
- Multi-language support for AI parsing
- Custom workflow automation rules (e.g., auto-assign deals based on sector)
- Slack/Teams notifications for stage changes
- Deal scoring model fine-tuning or custom model training
