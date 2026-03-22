---
card: 1
title: "Foundation & Auth Setup"
project: VentureMind
module: foundation
priority: critical
status: todo
estimated_effort: "5 days"
dependencies: []
assignee: null
tags: [nextjs, clerk, auth, ui-shell, shadcn]
---

# Card 1: Foundation & Auth Setup

## Summary

Scaffold the Next.js 16 application shell with Clerk authentication, role-based access control, dark-mode UI shell, and AI chat sidebar. This is the foundation everything else builds on.

## Deliverables

- [ ] Next.js 16 App Router project initialized
- [ ] Clerk auth integrated with org/fund multi-tenancy
- [ ] 5 roles configured: Admin, Partner, Associate, Analyst, LP
- [ ] Dark-mode dashboard layout: sidebar nav + main content + AI chat panel
- [ ] AI chat sidebar with AI Elements (Conversation, Message, PromptInput)
- [ ] Command palette (Cmd+K) with search
- [ ] proxy.ts with Clerk middleware
- [ ] Vercel project linked, AI Gateway enabled, `vercel env pull` done

## Tech Stack

Next.js 16, Clerk, shadcn/ui, Geist font, AI Elements, AI SDK v6

## Spec Reference

`docs/specs/spec-01-foundation-auth.md`

## Definition of Done

- App boots with Clerk auth flow working
- Users can sign in, create org, invite team members
- Role-based route protection active
- Dark-mode UI renders correctly
- AI chat sidebar opens and can send/receive messages
- Command palette triggers on Cmd+K
