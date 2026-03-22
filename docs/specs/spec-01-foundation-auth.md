---
spec: 1
title: "Foundation & Auth"
module: foundation-auth
status: draft
date: 2026-03-20
dependencies: []
estimated_effort: "5 days"
---

# Spec 1: Foundation & Auth

## Objective

Establish the VentureMind project scaffold on Next.js 16 App Router with Clerk-based authentication, organization/fund multi-tenancy, role-based access control, and a polished dark-mode dashboard shell that includes an AI chat panel and command palette.

## User Stories

- As a **fund admin**, I want to create an organization and invite team members with specific roles, so that my firm can collaborate securely on deal flow.
- As a **partner**, I want to sign in and land on a dark-mode dashboard with sidebar navigation, so that I can quickly access deals, portfolio, and reports.
- As an **associate**, I want to use Cmd+K to search across deals, companies, and contacts using AI-powered search, so that I can find information instantly without navigating menus.
- As an **LP investor**, I want read-only access scoped to my fund's data, so that I can monitor portfolio performance without modifying anything.
- As any **authenticated user**, I want to interact with an AI chat panel docked to the side of my workspace, so that I can ask questions, log deals, and get insights without leaving the current view.
- As a **fund admin**, I want to manage multiple funds under a single organization, so that our firm's different vehicles are logically separated but centrally governed.

## Functional Requirements

- [ ] Initialize Next.js 16 App Router project with TypeScript strict mode, ESLint, Prettier, and Tailwind CSS 4
- [ ] Configure path aliases (`@/components`, `@/lib`, `@/app`, etc.) in `tsconfig.json`
- [ ] Install and configure shadcn/ui component library with Geist font (sans + mono)
- [ ] Integrate Clerk authentication with email/password, Google OAuth, and magic link sign-in methods
- [ ] Implement `proxy.ts` Clerk middleware for route protection, session validation, and org context injection
- [ ] Define role-based access control with five roles: Admin, Partner, Associate, Analyst, LP (read-only)
- [ ] Enforce role permissions at both middleware and component level using Clerk organization metadata
- [ ] Support multi-tenancy at the organization level, with sub-isolation per fund within an organization
- [ ] Build a dark-mode dashboard shell layout with collapsible sidebar navigation, main content area, and resizable AI chat panel
- [ ] Implement sidebar navigation with sections: Dashboard, Deal Flow, Portfolio, Contacts, Reports, Meetings, Tasks, Settings
- [ ] Build AI chat sidebar using AI Elements: Conversation, Message, and PromptInput components
- [ ] Implement Cmd+K command palette with AI-powered semantic search across all entities
- [ ] Add global loading states, error boundaries, and 404/500 error pages
- [ ] Configure environment variable validation at startup using `@t3-oss/env-nextjs`
- [ ] Set up absolute imports and module resolution for clean import paths

## Technical Design

### Components

```
src/
  app/
    layout.tsx                    # Root layout with Clerk provider, theme provider
    (auth)/
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
    (dashboard)/
      layout.tsx                  # Dashboard shell: sidebar + main + AI panel
      page.tsx                    # Dashboard home
  components/
    layout/
      sidebar.tsx                 # Collapsible sidebar navigation
      sidebar-nav-item.tsx        # Individual nav item with icon, label, badge
      main-content.tsx            # Main content wrapper with breadcrumbs
      ai-chat-panel.tsx           # Resizable AI chat panel
      top-bar.tsx                 # Top bar with org switcher, search, user menu
    ai/
      conversation.tsx            # AI Elements Conversation wrapper
      message.tsx                 # AI Elements Message component
      prompt-input.tsx            # AI Elements PromptInput with suggestions
    command-palette/
      command-palette.tsx         # Cmd+K modal with search categories
      command-item.tsx            # Individual command/search result
      ai-search-provider.tsx      # AI-powered semantic search integration
    ui/                           # shadcn/ui primitives (button, card, dialog, etc.)
    theme/
      theme-provider.tsx          # Dark/light mode provider (default: dark)
      theme-toggle.tsx            # Theme toggle button
  lib/
    auth/
      roles.ts                   # Role definitions, permission maps
      guards.ts                  # Server-side auth guard utilities
      middleware-utils.ts         # Clerk middleware helpers
    env.ts                       # Environment variable validation schema
  middleware.ts                   # Next.js middleware entry (imports proxy.ts logic)
  proxy.ts                       # Clerk middleware with org context, role injection, route rules
```

### Data Model

At this stage, the auth-related data model is managed by Clerk externally. The application stores supplementary references:

| Entity | Fields | Notes |
|--------|--------|-------|
| **UserProfile** (Clerk-managed) | clerkId, email, firstName, lastName, avatarUrl, role | Synced via Clerk webhooks |
| **Organization** (Clerk-managed) | clerkOrgId, name, slug, logoUrl, plan | Multi-tenant root entity |
| **OrgMembership** (Clerk-managed) | userId, orgId, role, joinedAt | Role assignment per org |
| **Fund** (app-managed) | id, orgId, name, vintage, targetSize, status | Sub-tenant within org |

Role permission matrix:

| Permission | Admin | Partner | Associate | Analyst | LP |
|-----------|-------|---------|-----------|---------|-----|
| Manage org settings | Yes | No | No | No | No |
| Manage users/roles | Yes | No | No | No | No |
| Create/edit deals | Yes | Yes | Yes | No | No |
| View all deals | Yes | Yes | Yes | Yes | No |
| IC voting | Yes | Yes | No | No | No |
| View fund reports | Yes | Yes | Yes | Yes | Yes |
| Manage portfolio | Yes | Yes | Yes | No | No |
| Access AI chat | Yes | Yes | Yes | Yes | No |
| Export data | Yes | Yes | Yes | No | No |

### API Endpoints

No custom API endpoints in this spec. Authentication is handled entirely by Clerk's SDK and middleware. The following Clerk webhook endpoint is required:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/webhooks/clerk` | Sync user/org events from Clerk to local database |

### AI Integration

- **AI Chat Panel**: A persistent, resizable sidebar that uses AI Elements (Conversation, Message, PromptInput) to provide a conversational interface. The chat connects to the AI backend (configured in Spec 2+) and maintains conversation context per user session.
- **Command Palette AI Search**: The Cmd+K palette includes an AI search mode that performs semantic search across deals, companies, contacts, and documents. Results are ranked by relevance and presented with entity type badges, summaries, and quick-action buttons.
- **Suggested Prompts**: The AI chat panel surfaces contextual prompt suggestions based on the current page (e.g., on Deal Flow page: "Show me all Series A deals in fintech" or "What's the average deal size this quarter?").

## UI/UX

### Dashboard Shell

The primary layout is a three-panel design:

1. **Left: Collapsible Sidebar** (240px expanded, 64px collapsed)
   - VentureMind logo + org name at top
   - Navigation sections with icons (Lucide): Dashboard, Deal Flow, Portfolio, Contacts, Reports, Meetings, Tasks
   - Bottom: Settings, user avatar + role badge, collapse toggle
   - Smooth transition animation on collapse/expand
   - Active state: left border accent + background highlight

2. **Center: Main Content Area**
   - Top bar: breadcrumb trail, global search trigger (Cmd+K), notification bell, org switcher dropdown
   - Content area with consistent padding, max-width constraint for readability
   - Page-level loading skeletons using shadcn/ui Skeleton component

3. **Right: AI Chat Panel** (320px default, resizable 280px-600px)
   - Collapsible via toggle button on the panel edge
   - Header: "VentureMind AI" title + model indicator + clear conversation button
   - Conversation area with alternating user/assistant message bubbles
   - PromptInput at bottom with placeholder suggestions, file attachment support
   - Typing indicator with animated dots

### Sign-in / Sign-up Pages

- Centered card layout on a dark gradient background
- VentureMind branding: logo, tagline ("AI-Powered Venture Intelligence")
- Clerk-hosted UI components styled to match the dark theme
- Social sign-in buttons (Google) + email/password + magic link tabs

### Command Palette

- Triggered by Cmd+K (Mac) / Ctrl+K (Windows/Linux)
- Full-width modal overlay with search input at top
- Category tabs: All, Deals, Companies, Contacts, Actions
- AI-enhanced results with relevance scores and entity previews
- Recent searches section when input is empty
- Keyboard navigation: arrow keys, Enter to select, Esc to close

### Design Tokens

- **Background**: `hsl(224, 20%, 6%)` (near-black with blue undertone)
- **Surface**: `hsl(224, 15%, 10%)` (cards, sidebar)
- **Border**: `hsl(224, 10%, 18%)` (subtle dividers)
- **Primary accent**: `hsl(210, 100%, 52%)` (VentureMind blue)
- **Text primary**: `hsl(0, 0%, 95%)`
- **Text secondary**: `hsl(0, 0%, 60%)`
- **Font**: Geist Sans (body), Geist Mono (data, code)
- **Radius**: 8px default, 12px for cards, 16px for modals

## Acceptance Criteria

- [ ] Running `pnpm dev` starts the application without errors on `localhost:3000`
- [ ] Unauthenticated users are redirected to the sign-in page when accessing any dashboard route
- [ ] Users can sign in via email/password, Google OAuth, or magic link
- [ ] After sign-in, users land on the dashboard with their organization context loaded
- [ ] Sidebar navigation renders all sections and highlights the active route
- [ ] Sidebar collapses and expands with smooth animation, persisting state across page navigations
- [ ] AI chat panel opens, accepts input, and displays placeholder messages (backend integration in later specs)
- [ ] Cmd+K opens the command palette; typing filters results; keyboard navigation works
- [ ] Role-based UI elements are conditionally rendered (e.g., LP users do not see "Create Deal" buttons)
- [ ] Middleware correctly blocks unauthorized route access based on role (returns 403)
- [ ] Organization switcher allows users with multiple org memberships to switch context
- [ ] Fund selector within an organization scopes the dashboard data context
- [ ] All pages render correctly in dark mode with consistent design tokens
- [ ] Lighthouse accessibility score is 90+ on all pages
- [ ] No TypeScript errors; ESLint passes with zero warnings

## Out of Scope

- Database schema creation (covered in Spec 2)
- API routes for business entities (covered in Spec 2)
- Deal flow pipeline UI and logic (covered in Spec 3)
- AI model integration and prompt engineering (covered in later specs)
- Email/notification system
- Billing and subscription management
- Mobile-responsive layouts (desktop-first for v1)
- Internationalization (i18n)
