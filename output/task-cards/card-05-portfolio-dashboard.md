---
card: 5
title: "Portfolio Dashboard"
project: VentureMind
module: portfolio
priority: high
status: todo
estimated_effort: "7 days"
dependencies: [1, 2]
assignee: null
tags: [dashboard, metrics, health-scoring, anomaly, charts]
---

# Card 5: Portfolio Dashboard

## Summary

Build the portfolio monitoring dashboard with company health indicators, metric tracking, AI anomaly detection, fund-level performance metrics (IRR/TVPI/DPI/RVPI), and benchmarking.

## Deliverables

- [ ] Portfolio company grid with health indicators (green/yellow/red)
- [ ] Metric collection: manual entry + AI-parsed email updates
- [ ] AI health scoring algorithm (burn rate, revenue growth, runway, engagement, update freshness)
- [ ] Anomaly alerts via Vercel Queues (auto-detect significant metric changes)
- [ ] Sector benchmarking (anonymized peer comparison)
- [ ] Portfolio value tracking (markups/markdowns from round data)
- [ ] Fund-level metrics: IRR, TVPI, DPI, RVPI calculation
- [ ] Company detail page with time-series charts (Recharts)
- [ ] Materialized view `company_latest_metrics` for dashboard performance

## Performance Targets

- Dashboard grid: < 2s load time (Server Components + streaming)
- Health recalculation: < 5s after new metric insert
- Fund metrics: cached in Redis (1 hour TTL)

## Spec Reference

`docs/specs/spec-05-portfolio-dashboard.md`

## Definition of Done

- Dashboard loads < 2s with 50 portfolio companies
- Health scores auto-update on new metric data
- Anomaly alerts fire for significant changes (Z-score > 2)
- IRR/TVPI calculations match manual verification
