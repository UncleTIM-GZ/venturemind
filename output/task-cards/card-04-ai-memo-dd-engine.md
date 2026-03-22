---
card: 4
title: "AI Memo & DD Engine"
project: VentureMind
module: memos
priority: high
status: todo
estimated_effort: "8 days"
dependencies: [2, 3]
assignee: null
tags: [ai, memo, due-diligence, durable-agent, workflow, pdf]
---

# Card 4: AI Memo & DD Engine

## Summary

Build the AI-powered investment memo generator using DurableAgent (Workflow DevKit) for crash-resilient multi-step generation, plus DD checklist management and PDF/DOCX export.

## Deliverables

- [ ] Investment memo templates (customizable per fund, stored as JSON schema)
- [ ] DurableAgent workflow for memo generation (4 steps: gather → research → draft → assemble)
- [ ] Section-by-section streaming with AI Elements MessageResponse
- [ ] DD checklist generator (legal, financial, technical, commercial)
- [ ] Memo versioning with structured diff tracking
- [ ] Export to PDF (@react-pdf/renderer) and DOCX
- [ ] AI revision: regenerate specific sections with instructions
- [ ] AI gap analysis: "What's missing from this memo?"

## AI Integration

- Memo Agent (DurableAgent) with tools: gatherDealData, analyzeMarket, draftSection, assembleMemo
- Human-in-the-loop: pause for review before publishing
- Model: anthropic/claude-sonnet-4.6 for drafting

## Spec Reference

`docs/specs/spec-04-ai-memo-dd-engine.md`

## Definition of Done

- Memo generates from deal data in < 5 minutes
- Sections stream to UI in real-time
- DurableAgent resumes after crash (tested)
- PDF export renders cleanly
- Memo versions are diffable
