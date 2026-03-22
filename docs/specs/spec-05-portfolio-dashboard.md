---
spec: 5
title: "Portfolio Dashboard"
module: portfolio-dashboard
status: draft
date: 2026-03-20
dependencies: [1, 2]
estimated_effort: "7 days"
---

# Spec 5: Portfolio Dashboard

## Objective

Deliver a real-time portfolio monitoring dashboard that aggregates company health metrics, provides AI-driven anomaly detection, and surfaces fund-level performance indicators to give investment teams a single pane of glass across all portfolio companies.

## User Stories

- As a **fund manager**, I want to see all portfolio companies in a grid with health indicators, so that I can quickly identify which companies need attention.
- As an **analyst**, I want to manually enter monthly metrics for portfolio companies, so that the dashboard reflects the latest operating data.
- As a **partner**, I want AI to parse emailed founder updates and extract key metrics, so that data entry is minimized and metrics stay current.
- As a **fund manager**, I want to receive anomaly alerts when a portfolio company reports unusual metrics, so that I can intervene early.
- As an **analyst**, I want to benchmark portfolio companies against sector peers, so that I can contextualize their performance.
- As a **CFO**, I want to see fund-level metrics (IRR, TVPI, DPI, RVPI), so that I can report on overall fund performance.
- As a **partner**, I want to drill into a company detail page with time-series charts, so that I can analyze metric trends over time.
- As a **fund manager**, I want to track portfolio value changes (markups/markdowns), so that I can understand NAV movements.

## Functional Requirements

- [ ] Portfolio company grid view with sortable columns: name, sector, stage, last update, health score, key metrics
- [ ] Health indicator system: green (healthy), yellow (watch), red (critical) based on AI composite scoring
- [ ] Manual metric entry form with configurable metric definitions per company
- [ ] AI-parsed email update ingestion: process forwarded founder updates to extract metrics automatically
- [ ] AI health scoring engine: composite score from burn rate, revenue growth, runway, and engagement metrics
- [ ] Anomaly detection via Vercel Queues: background job that flags significant metric deviations
- [ ] Anomaly alerts delivered via in-app notifications and email digest
- [ ] Sector peer benchmarking with percentile rankings
- [ ] Portfolio value tracking: record markup/markdown events with rationale and date
- [ ] Fund-level aggregate metrics: IRR, TVPI, DPI, RVPI calculated from transaction and valuation data
- [ ] Company detail page with time-series metric charts (Recharts)
- [ ] Materialized views for dashboard query performance
- [ ] Date range filtering and metric comparison across periods
- [ ] CSV/Excel export of portfolio data and metrics

## Technical Design

### Components

```
src/
  modules/
    portfolio/
      components/
        PortfolioGrid.tsx           # Main grid with health indicators and sorting
        HealthIndicator.tsx          # Green/yellow/red badge with tooltip
        CompanyCard.tsx              # Grid card for each portfolio company
        MetricEntryForm.tsx          # Manual metric input with validation
        MetricTimeSeriesChart.tsx    # Recharts line/area chart per metric
        AnomalyAlertBanner.tsx      # In-app alert for detected anomalies
        BenchmarkComparison.tsx     # Sector peer comparison table/chart
        FundMetricsPanel.tsx         # IRR, TVPI, DPI, RVPI cards
        PortfolioValueTimeline.tsx   # Markup/markdown history visualization
        CompanyDetailPage.tsx        # Full company view with tabs
        EmailUpdateParser.tsx        # UI for reviewing AI-parsed email data
      hooks/
        usePortfolioGrid.ts          # Portfolio query with filters and sorting
        useCompanyMetrics.ts         # Time-series metric data
        useHealthScores.ts           # AI health score polling
        useFundMetrics.ts            # Fund-level aggregate calculations
        useAnomalyAlerts.ts          # Real-time anomaly alert subscription
      actions/
        submitMetrics.ts             # Server action: save manual metric entry
        parseEmailUpdate.ts          # Server action: AI parse founder email
        triggerHealthScoring.ts      # Server action: recompute health scores
        recordValuationEvent.ts      # Server action: markup/markdown entry
```

### Data Model

```sql
-- Portfolio companies (extends base company record from Spec 1)
CREATE TABLE portfolio_companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  fund_id         UUID NOT NULL REFERENCES funds(id),
  investment_date DATE NOT NULL,
  initial_amount  DECIMAL(15,2) NOT NULL,
  current_value   DECIMAL(15,2),
  ownership_pct   DECIMAL(5,4),
  board_seat      BOOLEAN DEFAULT false,
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','exited','written_off')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, fund_id)
);

-- Configurable metric definitions per company
CREATE TABLE metric_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES portfolio_companies(id),
  key             VARCHAR(100) NOT NULL,       -- e.g., 'mrr', 'burn_rate', 'headcount'
  label           VARCHAR(255) NOT NULL,
  unit            VARCHAR(50),                 -- '$', '%', '#', 'months'
  aggregation     VARCHAR(20) DEFAULT 'latest', -- 'latest', 'sum', 'average'
  is_core         BOOLEAN DEFAULT false,       -- included in health scoring
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Monthly metric snapshots
CREATE TABLE metric_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES portfolio_companies(id),
  metric_key      VARCHAR(100) NOT NULL,
  period          DATE NOT NULL,               -- first of month
  value           DECIMAL(20,4) NOT NULL,
  source          VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual','email_parse','api','import')),
  confidence      DECIMAL(3,2),                -- AI parsing confidence (0.00-1.00)
  submitted_by    UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, metric_key, period)
);

-- AI health scores
CREATE TABLE health_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES portfolio_companies(id),
  period          DATE NOT NULL,
  overall_score   DECIMAL(4,2) NOT NULL,       -- 0-100
  category        VARCHAR(10) NOT NULL CHECK (category IN ('green','yellow','red')),
  components      JSONB NOT NULL,              -- { burn_rate: 85, revenue_growth: 72, runway: 90, engagement: 65 }
  rationale       TEXT,                        -- AI-generated explanation
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, period)
);

-- Anomaly alerts
CREATE TABLE anomaly_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES portfolio_companies(id),
  metric_key      VARCHAR(100) NOT NULL,
  alert_type      VARCHAR(30) NOT NULL,        -- 'significant_drop', 'significant_spike', 'trend_reversal'
  severity        VARCHAR(10) NOT NULL CHECK (severity IN ('info','warning','critical')),
  message         TEXT NOT NULL,               -- e.g., "Company X reported 60% MoM revenue drop"
  current_value   DECIMAL(20,4),
  previous_value  DECIMAL(20,4),
  acknowledged    BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Valuation events (markups / markdowns)
CREATE TABLE valuation_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES portfolio_companies(id),
  event_type      VARCHAR(20) NOT NULL CHECK (event_type IN ('markup','markdown','exit','write_off')),
  previous_value  DECIMAL(15,2) NOT NULL,
  new_value       DECIMAL(15,2) NOT NULL,
  rationale       TEXT,
  event_date      DATE NOT NULL,
  recorded_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Sector benchmarks
CREATE TABLE sector_benchmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector          VARCHAR(100) NOT NULL,
  stage           VARCHAR(50) NOT NULL,
  metric_key      VARCHAR(100) NOT NULL,
  period          DATE NOT NULL,
  p25             DECIMAL(20,4),
  p50             DECIMAL(20,4),
  p75             DECIMAL(20,4),
  p90             DECIMAL(20,4),
  sample_size     INT,
  source          VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Materialized view for dashboard performance
-- Refreshed via scheduled Vercel Cron job every 15 minutes
CREATE MATERIALIZED VIEW mv_portfolio_dashboard AS
SELECT
  pc.id AS company_id,
  pc.fund_id,
  c.name AS company_name,
  c.sector,
  c.stage,
  pc.current_value,
  pc.ownership_pct,
  hs.overall_score AS health_score,
  hs.category AS health_category,
  hs.components AS health_components,
  ms_latest.metrics AS latest_metrics,
  aa.unacked_alerts
FROM portfolio_companies pc
JOIN companies c ON c.id = pc.company_id
LEFT JOIN LATERAL (
  SELECT * FROM health_scores
  WHERE company_id = pc.id
  ORDER BY period DESC LIMIT 1
) hs ON true
LEFT JOIN LATERAL (
  SELECT jsonb_object_agg(metric_key, value) AS metrics
  FROM metric_snapshots
  WHERE company_id = pc.id
    AND period = (SELECT MAX(period) FROM metric_snapshots WHERE company_id = pc.id)
) ms_latest ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS unacked_alerts
  FROM anomaly_alerts
  WHERE company_id = pc.id AND acknowledged = false
) aa ON true
WHERE pc.status = 'active';

CREATE UNIQUE INDEX ON mv_portfolio_dashboard (company_id, fund_id);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio` | List portfolio companies with health indicators (reads materialized view) |
| GET | `/api/portfolio/:companyId` | Company detail with full metric history |
| POST | `/api/portfolio/:companyId/metrics` | Submit metric snapshot (manual entry) |
| GET | `/api/portfolio/:companyId/metrics` | Get time-series metrics with optional date range |
| POST | `/api/portfolio/:companyId/metrics/parse-email` | AI-parse a forwarded founder email for metrics |
| GET | `/api/portfolio/:companyId/health` | Get health score history |
| POST | `/api/portfolio/health/recompute` | Trigger health score recomputation for all companies |
| GET | `/api/portfolio/:companyId/anomalies` | Get anomaly alerts for a company |
| PATCH | `/api/anomalies/:id/acknowledge` | Acknowledge an anomaly alert |
| GET | `/api/portfolio/:companyId/benchmarks` | Get sector peer benchmarks for a company |
| POST | `/api/portfolio/:companyId/valuations` | Record a markup/markdown event |
| GET | `/api/portfolio/:companyId/valuations` | Get valuation event history |
| GET | `/api/funds/:fundId/metrics` | Get fund-level aggregate metrics (IRR, TVPI, DPI, RVPI) |
| GET | `/api/portfolio/export` | Export portfolio data as CSV/Excel |

### AI Integration

**AI Health Scoring Engine**

Health scores are computed as a weighted composite of core metrics, with AI providing qualitative assessment:

```typescript
const computeHealthScore = async (companyId: string) => {
  const metrics = await getLatestCoreMetrics(companyId);
  const history = await getMetricHistory(companyId, { months: 6 });
  const benchmarks = await getSectorBenchmarks(companyId);

  const score = await aiGateway.complete({
    model: "anthropic/claude-sonnet-4.6",
    messages: [
      { role: "system", content: HEALTH_SCORING_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ metrics, history, benchmarks }) }
    ],
    response_format: { type: "json_object" }
    // Returns: { overall_score, category, components: { burn_rate, revenue_growth, runway, engagement }, rationale }
  });

  return score;
};
```

**Anomaly Detection via Vercel Queues**

A background job processes new metric submissions and flags anomalies:

```typescript
// Vercel Queue handler
export const anomalyDetectionQueue = defineQueue({
  name: "anomaly-detection",
  handler: async (job: { companyId: string; metricKey: string; period: string }) => {
    const current = await getMetricSnapshot(job.companyId, job.metricKey, job.period);
    const previous = await getPreviousMetricSnapshot(job.companyId, job.metricKey, job.period);

    if (!previous) return;

    const changePct = ((current.value - previous.value) / Math.abs(previous.value)) * 100;

    // Flag significant deviations (configurable thresholds)
    if (Math.abs(changePct) > 40) {
      const severity = Math.abs(changePct) > 60 ? "critical" : "warning";
      const alertType = changePct < 0 ? "significant_drop" : "significant_spike";

      await createAnomalyAlert({
        companyId: job.companyId,
        metricKey: job.metricKey,
        alertType,
        severity,
        message: `Company reported ${Math.abs(changePct).toFixed(0)}% MoM ${changePct < 0 ? "drop" : "increase"} in ${job.metricKey}`,
        currentValue: current.value,
        previousValue: previous.value,
      });

      // Send notification
      await notifyTeam(job.companyId, alertType, severity);
    }
  }
});
```

**AI Email Update Parsing**

Forwarded founder updates are parsed by AI to extract structured metrics:

```typescript
const parseEmailUpdate = async (emailBody: string, companyId: string) => {
  const metricDefs = await getMetricDefinitions(companyId);

  const parsed = await aiGateway.complete({
    model: "anthropic/claude-sonnet-4.6",
    messages: [
      { role: "system", content: "Extract numerical metrics from this founder update email. Return JSON with metric_key, value, and confidence (0-1) for each extracted metric." },
      { role: "user", content: `Known metrics: ${JSON.stringify(metricDefs)}\n\nEmail:\n${emailBody}` }
    ],
    response_format: { type: "json_object" }
  });

  return parsed; // { metrics: [{ metric_key, value, confidence }] }
};
```

## UI/UX

### Portfolio Grid View

- **Default view**: Card grid layout with each company showing name, logo, sector tag, health indicator (colored dot), key metrics summary (MRR, burn rate, runway), and last update timestamp
- **Table view toggle**: Switchable to a dense data table for power users with all columns sortable
- **Filters**: Sidebar filters for fund, sector, stage, health status, and date range
- **Search**: Real-time search across company names and sectors
- **Anomaly badges**: Red notification badge on company cards with unacknowledged alerts

### Company Detail Page

- **Header**: Company name, logo, health score with trend arrow, and quick action buttons
- **Tabs**: Overview | Metrics | Benchmarks | Valuations | Alerts | Notes
- **Overview tab**: Key metric cards at top, followed by a 2x2 grid of the most important time-series charts (Recharts)
- **Metrics tab**: Full time-series charts for all tracked metrics with period selector
- **Benchmarks tab**: Bar chart showing company metrics vs. sector P25/P50/P75/P90
- **Valuations tab**: Timeline visualization of markup/markdown events with rationale

### Fund Metrics Panel

- **Top-level cards**: IRR, TVPI, DPI, RVPI displayed prominently at the top of the dashboard
- **Vintage year breakdown**: Table showing metrics per vintage year
- **Portfolio value chart**: Stacked area chart showing aggregate portfolio value over time

### Anomaly Alert UX

- **Toast notification**: Appears in-app when a new critical anomaly is detected
- **Alert inbox**: Dedicated view listing all unacknowledged alerts with severity, company, metric, and change magnitude
- **Acknowledge flow**: Click to acknowledge with an optional note; acknowledged alerts move to a history tab

## Acceptance Criteria

- [ ] Portfolio grid loads within 500ms for funds with up to 100 portfolio companies (backed by materialized view)
- [ ] Health indicators correctly reflect AI-computed composite scores with green/yellow/red categorization
- [ ] Manual metric entry validates data types and creates snapshots that immediately appear in charts
- [ ] AI email parsing extracts metrics with confidence scores; low-confidence extractions require manual review
- [ ] Anomaly alerts fire within 5 minutes of metric submission for deviations exceeding configured thresholds
- [ ] Anomaly alert message format matches specification (e.g., "Company X reported 60% MoM revenue drop")
- [ ] Sector benchmarks render with percentile comparison charts
- [ ] Fund-level metrics (IRR, TVPI, DPI, RVPI) calculate correctly from transaction and valuation data
- [ ] Company detail page renders time-series charts (Recharts) with smooth interactions for up to 36 months of data
- [ ] Materialized views refresh on a 15-minute schedule without impacting dashboard responsiveness
- [ ] CSV/Excel export includes all visible portfolio data and metrics
- [ ] Valuation events are recorded with audit trail and reflected in portfolio value calculations

## Out of Scope

- Real-time API integrations with accounting software (QuickBooks, Xero) for automated metric ingestion
- Portfolio construction optimization or allocation modeling
- Automated cap table management and dilution calculations
- Co-investor performance comparison
- Mobile-native portfolio dashboard (responsive web is in scope)
- Predictive analytics or forecasting models for portfolio outcomes
