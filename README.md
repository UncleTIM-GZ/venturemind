# VentureMind

AI-Native VC Project Management Platform

## Overview

VentureMind is a full-stack, AI-native project management platform for small-to-medium Venture Capital firms. Unlike existing tools that bolt AI onto traditional CRUD interfaces, VentureMind makes AI the primary interaction paradigm.

**Target users:** VC firms managing $50M-$500M AUM, teams of 2-15 people.

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Server Components)
- **Auth:** Clerk
- **Database:** Neon Postgres
- **AI:** Vercel AI SDK + AI Gateway
- **UI:** shadcn/ui + Tailwind CSS + Geist font
- **Deployment:** Vercel

## Project Structure

```
docs/
  specs/          # 9 module specifications
  plans/          # Implementation plan
output/
  task-cards/     # 9 task cards (Twig Loop format)
  venturemind-prd.md              # Product Requirements Document
  venturemind-project-package.md  # Project package for Twig Loop
  venturemind-specs-complete.md   # All specs consolidated
```

## Modules (9 Cards)

| Phase | Card | Module | EWU |
|-------|------|--------|-----|
| 1 | 01 | Foundation & Auth Setup | 5.0 |
| 1 | 02 | Data Model & API Layer | 7.0 |
| 2 | 03 | Deal Flow Pipeline | 7.0 |
| 2 | 04 | AI Memo & DD Engine | 8.0 |
| 2 | 05 | Portfolio Dashboard | 7.0 |
| 3 | 06 | LP Portal & Reporting | 8.0 |
| 3 | 07 | Contact CRM & Network | 7.0 |
| 4 | 08 | Meeting & Document AI | 7.0 |
| 4 | 09 | Team Workspace & IC | 7.0 |

## Contributing via Twig Loop

This project is managed on [Twig Loop](https://twigloop.tech). To contribute:

1. Browse open tasks on Twig Loop
2. Review the task's execution contract
3. Apply to the task you want to work on
4. After acceptance, **fork this repo**
5. Create branch: `feat/twigloop-{task_id}`
6. Complete the work and open a PR against `main`
7. Submit your completion report on Twig Loop (PR URL + summary)

All code is delivered via GitHub fork + PR. See task cards in `output/task-cards/` for details.

## License

Proprietary. All rights reserved.
