---
spec: 9
title: "Team Workspace & IC Flow"
module: team-workspace
status: draft
date: 2026-03-20
dependencies: [1, 2]
estimated_effort: "7 days"
---

# Spec 9: Team Workspace & IC Flow

## Objective

Provide a collaborative team workspace with task management, an end-to-end Investment Committee (IC) meeting workflow, AI-prioritized notifications, activity feeds, and automated briefing generation, enabling VC teams to coordinate effectively and make faster, better-documented investment decisions.

## User Stories

- As a **partner**, I want to schedule an IC meeting and have the system automatically generate a pre-IC briefing package for each agenda item, so that the committee is prepared without manual work.
- As a **principal**, I want a personal task board showing my action items across all deals, so that I can manage my workload in one place.
- As a **partner**, I want to cast votes on IC agenda items (approve, reject, table, request more info) both synchronously during the meeting and asynchronously beforehand, so that decisions are captured regardless of attendance.
- As an **associate**, I want a notification center that distinguishes urgent items from informational updates, so that I can focus on what matters.
- As a **team member**, I want an activity feed showing all entity changes (deals, contacts, documents) in chronological order, so that I stay informed about team activity.
- As a **partner**, I want a daily AI briefing delivered at 8am summarizing what happened yesterday and what needs attention today, so that I start each day informed.
- As a **managing partner**, I want a weekly digest email summarizing portfolio performance, deal pipeline changes, and upcoming IC items, so that I have a high-level view without logging in.
- As a **principal**, I want IC decisions formally recorded with vote tallies, discussion notes, and rationale, so that we maintain a clear audit trail.
- As a **team member**, I want to assign tasks to colleagues with due dates and priority levels, so that follow-ups from meetings and reviews are tracked.

## Functional Requirements

### Task Board
- [ ] **Task CRUD**: Create tasks with title, description, assignee, due date, priority (urgent, high, medium, low), status (todo, in-progress, blocked, done), and optional links to deal, company, or contact.
- [ ] **Personal View**: Kanban board filtered to current user's assigned tasks, grouped by status columns.
- [ ] **Team View**: Kanban board showing all team tasks within the fund, filterable by assignee, priority, due date, and linked entity.
- [ ] **Task from Action Items**: One-click task creation from AI-extracted meeting note action items (Spec 8 integration).
- [ ] **Due Date Reminders**: Automated reminders at 1 day before and on due date, delivered via notification center.

### IC Meeting Workflow
- [ ] **IC Scheduling**: Create IC meeting with date/time, attendees, and agenda items. Each agenda item links to a deal.
- [ ] **Pre-IC Briefing Generation**: AI-generated briefing package per agenda item containing: deal summary, current pipeline stage, key metrics, recent interaction history, relevant document summaries, AI deal score with rationale, and open questions. Generated via a DurableAgent workflow that gathers data from multiple sources.
- [ ] **Voting System**: Per agenda item, each committee member can vote: approve, reject, table, or request-more-info. Support both synchronous (during meeting) and asynchronous (before/after meeting within a configurable window) voting. Anonymous voting option configurable per meeting.
- [ ] **Decision Record**: After voting closes, auto-generate a decision record capturing: vote tally, final decision (based on configurable rules -- e.g., majority, unanimous), discussion notes, conditions/follow-ups, and timestamp. Decision records are immutable once finalized.
- [ ] **IC History**: Browse past IC meetings with full agenda, votes, and decision records.

### Notification Center
- [ ] **Notification Types**: task-assigned, task-due, ic-scheduled, ic-vote-requested, deal-stage-changed, document-shared, mention, ai-suggestion, system-alert.
- [ ] **AI Prioritization**: Classify notifications as urgent (requires action within 24h) or informational using a lightweight LLM classifier. Urgent notifications get visual emphasis and optional push/email escalation.
- [ ] **Read/Unread State**: Mark individual or bulk as read. Separate badge counts for urgent vs total unread.
- [ ] **Notification Preferences**: Per-user settings for each notification type: in-app, email, both, or muted.

### Activity Feed
- [ ] **Entity Change Tracking**: Record all create/update/delete events for deals, contacts, companies, documents, tasks, and IC meetings.
- [ ] **Chronological Feed**: Paginated, reverse-chronological feed with entity type icons, actor name, action summary, and timestamp.
- [ ] **Filters**: Filter by entity type, actor, date range, and linked deal/company.
- [ ] **Real-time Updates**: New activity items appear via WebSocket (or SSE) without page refresh.

### AI Briefings & Digests
- [ ] **Daily Briefing**: Cron job at 8am (per user's timezone) that generates a personalized briefing: yesterday's key activities, tasks due today, upcoming IC meetings, AI suggestions, and deal stage changes. Delivered as in-app notification + email.
- [ ] **Weekly Digest**: Cron job on Monday 7am generating a partner-level digest: portfolio KPI summary, pipeline funnel changes, new deals added, IC decisions made, and upcoming week's agenda. Delivered as email with in-app archive.
- [ ] **IC Briefing Package**: DurableAgent workflow triggered when an IC meeting is scheduled. For each agenda item: query deal data, fetch recent interactions, pull document summaries, compute deal score, and compile into a structured briefing document. Workflow handles retries and partial failures gracefully.

## Technical Design

### Components

```
src/
  modules/
    workspace/
      components/
        TaskBoard.tsx             # Kanban board with drag-and-drop (dnd-kit)
        TaskCard.tsx              # Individual task card
        TaskDetail.tsx            # Task detail modal/drawer
        TaskForm.tsx              # Create/edit task form
        NotificationCenter.tsx    # Notification dropdown/panel
        NotificationItem.tsx      # Individual notification row
        NotificationPreferences.tsx
        ActivityFeed.tsx          # Chronological activity stream
        ActivityItem.tsx          # Individual activity entry
        DailyBriefingCard.tsx     # Daily briefing display
        WeeklyDigestView.tsx      # Weekly digest archive viewer
      hooks/
        useTasks.ts               # Task CRUD + filters (TanStack Query)
        useNotifications.ts       # Notification queries + real-time subscription
        useActivityFeed.ts        # Activity feed queries with infinite scroll
        useBriefing.ts            # Daily/weekly briefing queries
    ic/
      components/
        ICMeetingScheduler.tsx    # Create/edit IC meeting form
        ICMeetingDetail.tsx       # Meeting view with agenda, briefing, votes
        ICAgendaItem.tsx          # Individual agenda item with briefing + voting
        ICVotingPanel.tsx         # Vote casting interface
        ICDecisionRecord.tsx      # Finalized decision display
        ICBriefingPackage.tsx     # AI-generated briefing document viewer
        ICHistory.tsx             # Past IC meetings browser
      hooks/
        useICMeetings.ts          # IC meeting CRUD
        useICVoting.ts            # Voting operations
        useICBriefing.ts          # Briefing package queries
      api/
        ic.router.ts              # IC meeting API routes
      workers/
        briefing.workflow.ts      # DurableAgent IC briefing generation
        voting.worker.ts          # Vote tallying and decision record generation
    shared/
      workers/
        daily-briefing.cron.ts    # Daily briefing cron job (Inngest)
        weekly-digest.cron.ts     # Weekly digest cron job (Inngest)
        notification.worker.ts    # Notification dispatch + email sending
        activity.listener.ts     # Database trigger listener for activity feed
```

### Data Model

```sql
-- Tasks
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  assignee_id   UUID NOT NULL REFERENCES users(id),
  created_by    UUID NOT NULL REFERENCES users(id),
  status        VARCHAR(20) NOT NULL DEFAULT 'todo', -- todo, in-progress, blocked, done
  priority      VARCHAR(10) NOT NULL DEFAULT 'medium', -- urgent, high, medium, low
  due_date      DATE,
  deal_id       UUID REFERENCES deals(id),
  company_id    UUID REFERENCES companies(id),
  contact_id    UUID REFERENCES contacts(id),
  source_type   VARCHAR(30),     -- meeting-action-item, manual, ic-follow-up
  source_id     UUID,            -- reference to originating entity
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_fund ON tasks(fund_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id, status);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status != 'done';
CREATE INDEX idx_tasks_deal ON tasks(deal_id);

-- IC Meetings
CREATE TABLE ic_meetings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  title         VARCHAR(500) NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INTEGER DEFAULT 60,
  attendees     UUID[] NOT NULL,       -- user IDs
  voting_window_start TIMESTAMPTZ,     -- async voting opens
  voting_window_end   TIMESTAMPTZ,     -- async voting closes
  anonymous_voting BOOLEAN DEFAULT FALSE,
  status        VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in-progress, completed, cancelled
  notes         TEXT,                  -- general meeting notes
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ic_meetings_fund ON ic_meetings(fund_id);
CREATE INDEX idx_ic_meetings_scheduled ON ic_meetings(scheduled_at DESC);

-- IC Agenda Items
CREATE TABLE ic_agenda_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id    UUID NOT NULL REFERENCES ic_meetings(id) ON DELETE CASCADE,
  deal_id       UUID NOT NULL REFERENCES deals(id),
  position      INTEGER NOT NULL,      -- ordering within agenda
  briefing      JSONB,                 -- AI-generated briefing package
  briefing_status VARCHAR(20) DEFAULT 'pending', -- pending, generating, ready, failed
  discussion_notes TEXT,
  decision       VARCHAR(30),          -- approved, rejected, tabled, deferred
  conditions     TEXT,                 -- conditions attached to decision
  decided_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agenda_meeting ON ic_agenda_items(meeting_id);
CREATE INDEX idx_agenda_deal ON ic_agenda_items(deal_id);

-- IC Votes
CREATE TABLE ic_votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID NOT NULL REFERENCES ic_agenda_items(id) ON DELETE CASCADE,
  voter_id      UUID NOT NULL REFERENCES users(id),
  vote          VARCHAR(20) NOT NULL,  -- approve, reject, table, request-more-info
  comment       TEXT,
  voted_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agenda_item_id, voter_id)
);

CREATE INDEX idx_votes_agenda ON ic_votes(agenda_item_id);

-- Decision Records (immutable)
CREATE TABLE ic_decision_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id  UUID NOT NULL REFERENCES ic_agenda_items(id) ON DELETE CASCADE,
  meeting_id      UUID NOT NULL REFERENCES ic_meetings(id),
  deal_id         UUID NOT NULL REFERENCES deals(id),
  vote_tally      JSONB NOT NULL,      -- { approve: N, reject: N, table: N, request_more_info: N }
  final_decision  VARCHAR(30) NOT NULL,
  decision_rule   VARCHAR(50) NOT NULL, -- majority, unanimous, supermajority
  rationale       TEXT,
  conditions      TEXT,
  follow_ups      JSONB DEFAULT '[]',  -- [{ task, assignee_id, due_date }]
  finalized_by    UUID NOT NULL REFERENCES users(id),
  finalized_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_meeting ON ic_decision_records(meeting_id);
CREATE INDEX idx_decisions_deal ON ic_decision_records(deal_id);

-- Notifications
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  type          VARCHAR(30) NOT NULL,  -- task-assigned, task-due, ic-scheduled, ic-vote-requested, deal-stage-changed, document-shared, mention, ai-suggestion, system-alert
  title         VARCHAR(500) NOT NULL,
  body          TEXT,
  priority      VARCHAR(15) DEFAULT 'informational', -- urgent, informational
  entity_type   VARCHAR(20),           -- deal, contact, task, ic-meeting, document
  entity_id     UUID,
  is_read       BOOLEAN DEFAULT FALSE,
  email_sent    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(user_id, priority)
  WHERE is_read = FALSE;

-- Notification Preferences
CREATE TABLE notification_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  notification_type VARCHAR(30) NOT NULL,
  channel       VARCHAR(10) NOT NULL DEFAULT 'both', -- in-app, email, both, muted
  UNIQUE(user_id, notification_type)
);

-- Activity Feed
CREATE TABLE activity_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  actor_id      UUID NOT NULL REFERENCES users(id),
  action        VARCHAR(20) NOT NULL,  -- created, updated, deleted, commented, voted, decided
  entity_type   VARCHAR(20) NOT NULL,  -- deal, contact, company, document, task, ic-meeting
  entity_id     UUID NOT NULL,
  entity_name   VARCHAR(500),          -- denormalized for feed display
  metadata      JSONB DEFAULT '{}',    -- additional context (e.g., { field: "stage", old: "screening", new: "due-diligence" })
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_fund ON activity_events(fund_id, created_at DESC);
CREATE INDEX idx_activity_actor ON activity_events(actor_id, created_at DESC);
CREATE INDEX idx_activity_entity ON activity_events(entity_type, entity_id);

-- Daily/Weekly Briefings
CREATE TABLE briefings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  type          VARCHAR(10) NOT NULL,  -- daily, weekly
  content       JSONB NOT NULL,        -- structured briefing content
  delivered_via VARCHAR(20)[] DEFAULT '{in-app}', -- in-app, email
  period_start  TIMESTAMPTZ NOT NULL,
  period_end    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_briefings_user ON briefings(user_id, type, created_at DESC);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| **Tasks** | | |
| GET | `/api/tasks` | List tasks with filters (assignee, status, priority, deal, due date) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/:id` | Get task detail |
| PUT | `/api/tasks/:id` | Update task (status, assignee, etc.) |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/from-action-item` | Create task from meeting action item |
| **IC Meetings** | | |
| GET | `/api/ic-meetings` | List IC meetings (upcoming + past) |
| POST | `/api/ic-meetings` | Schedule a new IC meeting |
| GET | `/api/ic-meetings/:id` | Get IC meeting with agenda, votes, decisions |
| PUT | `/api/ic-meetings/:id` | Update IC meeting (reschedule, add agenda items) |
| DELETE | `/api/ic-meetings/:id` | Cancel IC meeting |
| POST | `/api/ic-meetings/:id/agenda` | Add an agenda item (link a deal) |
| PUT | `/api/ic-meetings/:id/agenda/:item_id` | Update agenda item (discussion notes, position) |
| DELETE | `/api/ic-meetings/:id/agenda/:item_id` | Remove agenda item |
| POST | `/api/ic-meetings/:id/agenda/:item_id/vote` | Cast or update a vote |
| GET | `/api/ic-meetings/:id/agenda/:item_id/votes` | Get vote tally (respects anonymous setting) |
| POST | `/api/ic-meetings/:id/agenda/:item_id/finalize` | Finalize decision and generate record |
| GET | `/api/ic-meetings/:id/agenda/:item_id/briefing` | Get AI-generated briefing package |
| POST | `/api/ic-meetings/:id/generate-briefings` | Trigger briefing generation for all agenda items |
| **Notifications** | | |
| GET | `/api/notifications` | List notifications (paginated, filter by read/unread, priority) |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| PUT | `/api/notifications/read-all` | Mark all notifications as read |
| GET | `/api/notifications/preferences` | Get notification preferences |
| PUT | `/api/notifications/preferences` | Update notification preferences |
| GET | `/api/notifications/count` | Get unread counts (total + urgent) |
| **Activity Feed** | | |
| GET | `/api/activity` | Get activity feed (paginated, with filters) |
| GET | `/api/activity/stream` | SSE endpoint for real-time activity updates |
| **Briefings** | | |
| GET | `/api/briefings/daily` | Get today's daily briefing |
| GET | `/api/briefings/weekly` | Get latest weekly digest |
| GET | `/api/briefings/history` | List past briefings |

### AI Integration

1. **IC Briefing Package (DurableAgent Workflow)**
   - Triggered when an IC meeting is scheduled or when briefing generation is manually requested.
   - DurableAgent workflow steps per agenda item:
     1. **Fetch Deal Data**: Query deal record, pipeline stage, scores, financial data.
     2. **Gather Interactions**: Pull last 30 days of interactions linked to the deal or its company/contacts.
     3. **Summarize Documents**: Retrieve recent documents linked to the deal, use existing AI summaries or generate new ones.
     4. **Compute Deal Score**: Run the scoring model from Spec 3 if stale (> 24h old).
     5. **Compile Briefing**: Send all gathered context to LLM with a structured prompt to produce: executive summary (3-5 sentences), key metrics table, recent activity timeline, risk factors, open questions for committee, and AI recommendation with rationale.
   - Workflow handles partial failures: if one data source is unavailable, continue with available data and note the gap.
   - Output stored as JSONB in `ic_agenda_items.briefing`. Status tracked via `briefing_status`.
   - Target: complete briefing generation for a 5-item agenda within 2 minutes.

2. **Notification Prioritization**
   - Lightweight LLM classifier (or rule-based with LLM fallback) determines urgency.
   - Rules: task due today/overdue = urgent; IC vote requested within 24h = urgent; deal stage change for owned deals = urgent; everything else = informational.
   - LLM fallback for ambiguous cases: send notification content + user context, classify as urgent/informational.

3. **Daily Briefing Generation**
   - Cron job (Inngest scheduled function) at 8am per user's configured timezone.
   - Gathers: yesterday's activity events for the user's fund, user's tasks due today, upcoming IC meetings within 7 days, pending AI suggestions, deal stage changes.
   - LLM generates a conversational briefing in structured JSON: `{ greeting, highlights: string[], tasks_due: Task[], upcoming_ic: ICMeeting[], suggestions: string[], pipeline_changes: string[] }`.
   - Delivered as in-app notification (type: daily-briefing) and optionally as email (based on user preference).

4. **Weekly Digest Generation**
   - Cron job on Monday 7am.
   - Aggregates: portfolio KPI deltas (week-over-week), pipeline funnel snapshot, new deals added, IC decisions made, tasks completed vs created, notable activity.
   - LLM produces a structured digest with section headings, bullet points, and key numbers.
   - Delivered as formatted email (React Email template) with in-app archive.

## UI/UX

### Task Board
- Kanban layout with four columns: To Do, In Progress, Blocked, Done.
- Cards show: title, assignee avatar, priority badge (color-coded), due date (red if overdue), linked entity chip.
- Drag-and-drop between columns (using dnd-kit) to update status.
- Toggle between "My Tasks" and "Team Tasks" views.
- Quick-add: click "+" on a column header to create a task inline.
- Filter bar: assignee dropdown, priority multi-select, due date range, linked deal/company search.

### IC Meeting View
- Header: meeting title, date/time, attendee avatars, status badge.
- Agenda list: ordered items, each showing deal name, briefing status indicator, vote summary donut chart.
- Expand an agenda item to see:
  - **Briefing tab**: AI-generated briefing with sections: executive summary, metrics, activity, risks, questions, recommendation.
  - **Discussion tab**: free-text notes area for capturing live discussion.
  - **Voting tab**: vote buttons (approve/reject/table/request-more-info) with optional comment. Shows anonymized or named vote tally based on meeting settings.
  - **Decision tab** (post-vote): finalized decision record with tally, conditions, and follow-up tasks.
- Bottom bar: "Generate All Briefings" button, "Close Meeting & Finalize" button.

### Notification Center
- Bell icon in the top navigation bar with badge count (red dot for urgent, grey for informational).
- Dropdown panel: two tabs -- "Urgent" and "All".
- Each notification: icon by type, title, body preview, timestamp, read/unread indicator.
- Click to navigate to the relevant entity.
- "Mark all as read" button. Gear icon links to notification preferences.

### Activity Feed
- Full-page view and sidebar widget version.
- Stream of activity items: avatar, actor name, action verb, entity link, timestamp.
- Example: "[Alice] moved [Acme Corp] to Due Diligence -- 2 hours ago".
- Entity type filter tabs: All, Deals, Contacts, Documents, Tasks, IC.
- Infinite scroll with real-time prepend for new items.

### Daily Briefing
- Modal or dedicated page that auto-opens on first login of the day (dismissable, with "don't show again today" option).
- Sections: greeting, highlights, tasks due, upcoming IC, pipeline changes, suggestions.
- Each section is collapsible. Action items are clickable links.

## Acceptance Criteria

- [ ] Tasks can be created, assigned, updated, and organized on a Kanban board. Drag-and-drop correctly updates task status within 200ms.
- [ ] IC meetings can be scheduled with agenda items linked to deals. Briefing generation completes within 2 minutes for a 5-item agenda.
- [ ] Votes can be cast synchronously and asynchronously. Decision records are generated accurately reflecting the vote tally and configured decision rule.
- [ ] Decision records are immutable once finalized -- no edits allowed via API or UI after finalization.
- [ ] Notifications are classified as urgent or informational with > 90% accuracy on a test set.
- [ ] Activity feed displays events in real-time (< 3 second delay from action to feed appearance) via SSE.
- [ ] Daily briefing is generated and delivered by 8:15am (user's timezone) with relevant, accurate content.
- [ ] Weekly digest email is sent by 7:30am Monday with correct portfolio and pipeline data.
- [ ] Notification preferences are respected -- muted types produce no in-app or email notifications.
- [ ] All data is scoped to fund_id; no cross-fund data leakage in tasks, notifications, activity feed, or IC meetings.
- [ ] Task due date reminders fire at 1 day before and on the due date.
- [ ] IC briefing package includes deal score, recent interactions, and document summaries with correct data.

## Out of Scope

- Video conferencing integration (Zoom, Google Meet) for IC meetings -- external meeting links only.
- Recurring task templates or task automation rules.
- Mobile push notifications (in-app and email only for this iteration).
- Slack/Teams integration for notification delivery.
- Role-based task visibility (all fund members see all tasks for this iteration).
- Historical analytics on IC decision patterns.
- Custom workflow states beyond the four default columns.
- Multi-fund IC meetings (single fund scope per meeting).
