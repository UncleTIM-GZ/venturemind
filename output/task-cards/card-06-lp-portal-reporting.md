---
card: 6
title: "LP Portal & Reporting"
project: VentureMind
module: lp-reporting
priority: high
status: todo
estimated_effort: "8 days"
dependencies: [2, 5]
assignee: null
tags: [lp, reporting, portal, durable-agent, pdf, security]
---

# Card 6: LP Portal & Reporting

## Summary

Build the LP-facing portal with AI-drafted quarterly reports, capital call/distribution notices, fund performance visualization, approval workflow, and secure document sharing.

## Deliverables

- [ ] LP portal (subdomain or path-based, separate auth context)
- [ ] Quarterly report AI drafting using DurableAgent workflow
- [ ] Capital call / distribution notice generation (PDF)
- [ ] Fund performance charts (waterfall, IRR time-series)
- [ ] Report approval workflow (draft → partner review → approve → publish)
- [ ] Historical report archive with search
- [ ] LP data room (secure document sharing via Vercel Blob signed URLs)
- [ ] Per-LP data scoping (zero-trust: LP sees only their data)

## Security Requirements

- LP portal uses separate auth (not same Clerk org as internal team)
- LP PII never sent to AI Gateway prompts
- Document URLs use signed URLs with 1-hour expiry
- Audit log for all LP data access

## Spec Reference

`docs/specs/spec-06-lp-portal-reporting.md`

## Definition of Done

- LP can sign in and see only their fund's reports
- Quarterly report generates from portfolio data via DurableAgent
- Partner can review, edit, and approve before publishing
- PDF export matches report content
- Data room documents accessible only to authorized LPs
