---
card: 7
title: "Contact CRM & Network Graph"
project: VentureMind
module: crm
priority: medium
status: todo
estimated_effort: "7 days"
dependencies: [1, 2]
assignee: null
tags: [crm, contacts, network-graph, warm-intro, react-flow]
---

# Card 7: Contact CRM & Network Graph

## Summary

Build the contact management system with relationship scoring, network graph visualization, warm intro path finder, contact enrichment, and AI relationship suggestions.

## Deliverables

- [ ] Contact database with relationship scoring (frequency × recency × depth)
- [ ] Network graph visualization using @xyflow/react (clustered + ego-network views)
- [ ] Warm intro path finder: BFS via recursive CTE, max 3 degrees
- [ ] Auto-enrichment from LinkedIn/Crunchbase API (rate-limited)
- [ ] Interaction logging (meetings, emails, notes)
- [ ] AI relationship suggestions: "Reconnect with [contact] — they moved to [relevant company]"
- [ ] Contact de-duplication (fuzzy matching + AI confirmation)
- [ ] Search-first interaction (type name → see connections)

## Technical Notes

- DO NOT use force-directed layout for 1000+ contacts — use clustered/ego-network
- Recursive CTE for path finding (not application-level BFS)
- pgvector on Contact.bio for semantic search

## Spec Reference

`docs/specs/spec-07-contact-crm-network.md`

## Definition of Done

- Contacts searchable by name, company, tag
- Network graph renders with clustered layout
- Warm intro path found in < 2s for 3-degree search
- AI suggestions surface relevant reconnection opportunities
