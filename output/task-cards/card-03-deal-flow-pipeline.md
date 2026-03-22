---
card: 3
title: "Deal Flow Pipeline"
project: VentureMind
module: deals
priority: high
status: todo
estimated_effort: "7 days"
dependencies: [1, 2]
assignee: null
tags: [kanban, deals, ai-scoring, pipeline, dnd-kit]
---

# Card 3: Deal Flow Pipeline

## Summary

Build the Kanban-style deal pipeline with drag-and-drop, AI-powered deal intake via chat, structured deal scoring, batch import, and pipeline analytics.

## Deliverables

- [ ] Kanban board with configurable stages (Sourced → Screening → DD → IC → Term Sheet → Closed/Passed)
- [ ] Drag-and-drop with @dnd-kit (accessible, performant)
- [ ] Deal intake via AI chat: parse natural language into structured deal data
- [ ] AI deal scoring (market, team, traction, fit) using structured output
- [ ] Batch deal import from CSV/Excel with preview + validation
- [ ] Email-to-deal capture (parse forwarded pitch emails)
- [ ] Deal comparison view (side-by-side with radar chart)
- [ ] Pipeline analytics: conversion rates, stage velocity, source attribution
- [ ] Deal stage history tracking for velocity metrics

## AI Integration

- Deal Agent with tools: createDeal, scoreDeal, compareDeal, enrichDeal
- Structured output schema (DealScoreSchema) via AI SDK v6
- Model: google/gemini-3.1-flash for scoring, anthropic/claude-sonnet-4.6 for chat

## Spec Reference

`docs/specs/spec-03-deal-flow-pipeline.md`

## Definition of Done

- Deals can be created via form, AI chat, CSV import, and email forwarding
- Kanban drag-and-drop updates stage in DB
- AI scoring returns structured scores with reasoning
- Pipeline analytics shows conversion funnel
