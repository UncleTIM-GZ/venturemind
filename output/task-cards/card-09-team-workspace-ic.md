---
card: 9
title: "Team Workspace & IC Flow"
project: VentureMind
module: collaboration
priority: medium
status: todo
estimated_effort: "7 days"
dependencies: [1, 2]
assignee: null
tags: [tasks, ic-workflow, notifications, briefing, voting, activity-feed]
---

# Card 9: Team Workspace & IC Flow

## Summary

Build the team collaboration layer: task management, Investment Committee workflow (schedule → brief → vote → decide), AI-prioritized notifications, activity feed, and AI daily briefing.

## Deliverables

- [ ] Task board (personal + team views) with status columns
- [ ] IC meeting workflow:
  - Schedule: pick date, add deals to agenda
  - Pre-IC: AI generates briefing package (DurableAgent)
  - During IC: voting interface (Invest / Pass / More DD / Table)
  - Post-IC: decision record with conditions, auto-update deal stage
- [ ] Async voting support (vote within 48h, auto-reminders)
- [ ] Notification center (AI-prioritized: urgent vs informational)
- [ ] Activity feed (chronological stream of entity changes)
- [ ] AI daily briefing (cron job at 8am, per-user)
- [ ] Weekly digest generation for partners (email)

## AI Integration

- IC Briefing Agent (DurableAgent): gather deal data, scores, notes → compile per-deal summary
- Triage Agent: prioritize notifications (urgent: LP report due, anomaly alert; info: new deal, metric update)
- Daily Briefing Agent: "Here's what happened yesterday and what needs your attention"

## Spec Reference

`docs/specs/spec-09-team-workspace-ic.md`

## Definition of Done

- Tasks can be created, assigned, completed
- IC workflow supports full cycle (schedule → vote → record)
- Async voting works with 48h window + reminders
- Daily briefing generates and delivers via notification + email
- Activity feed shows recent changes across all entities
