---
spec: 7
title: "Contact CRM & Network Graph"
module: contact-crm
status: draft
date: 2026-03-20
dependencies: [1, 2]
estimated_effort: "7 days"
---

# Spec 7: Contact CRM & Network Graph

## Objective

Provide a comprehensive contact relationship management system with network graph visualization, enabling VC professionals to map, score, and leverage their professional networks for deal sourcing, warm introductions, and ongoing relationship maintenance.

## User Stories

- As a **partner**, I want to see a visual network graph of my contacts, so that I can identify warm intro paths to founders and co-investors.
- As an **associate**, I want to log interactions (meetings, emails, notes) against a contact, so that our team maintains a shared history of every relationship.
- As a **partner**, I want a relationship score calculated from frequency, recency, and depth of interactions, so that I can prioritize relationship maintenance.
- As a **principal**, I want the system to find warm introduction paths (max 3 hops) between me and a target contact, so that I can leverage existing relationships to reach new founders.
- As an **associate**, I want contacts auto-enriched from LinkedIn and Crunchbase, so that I spend less time on manual data entry.
- As a **partner**, I want AI-driven reconnection suggestions (e.g., "You should reconnect with [contact] -- they moved to [relevant company]"), so that I never miss relationship signals.
- As an **analyst**, I want duplicate contacts detected and merged automatically, so that the CRM stays clean and reliable.
- As a **partner**, I want to filter and search contacts by company, role, tags, relationship score, and last interaction date, so that I can quickly find the right person.

## Functional Requirements

- [ ] **Contact Database**: CRUD operations for contacts with fields: name, email, phone, company, title, LinkedIn URL, location, tags, notes, source, created_by, created_at, updated_at.
- [ ] **Relationship Scoring**: Compute a composite relationship score per contact using the formula: `score = w1 * frequency_score + w2 * recency_score + w3 * depth_score` where frequency = interaction count in trailing 90 days (normalized 0-1), recency = inverse decay from last interaction date, depth = weighted sum of interaction types (meeting > call > email > note).
- [ ] **Network Graph Visualization**: Interactive graph rendered with @xyflow/react supporting clustered layout (group by company, sector, or tag) and ego-network view (centered on selected contact, showing N-degree connections).
- [ ] **Warm Intro Path Finder**: BFS traversal over contact-knows-contact edges, max depth 3, implemented as a recursive CTE in Postgres. Return all shortest paths between source and target contacts.
- [ ] **Auto-Enrichment**: Background enrichment jobs pulling data from LinkedIn API and Crunchbase API. Rate-limited to respect API quotas (LinkedIn: 100 req/day, Crunchbase: 200 req/day). Enriched fields: current company, title, bio, profile photo, funding history.
- [ ] **Interaction Logging**: Record interactions of type: meeting, email, call, note, introduction. Each interaction links to a contact, optionally to a deal or company, and stores timestamp, summary, and participants.
- [ ] **AI Relationship Suggestions**: Nightly batch job analyzing contact changes (job changes, company funding events, news mentions) to generate actionable reconnection suggestions delivered via notification center.
- [ ] **Contact De-duplication**: Fuzzy matching pipeline using Levenshtein distance on name + Jaccard similarity on email domain + exact match on LinkedIn URL. Candidate pairs above threshold are presented for AI confirmation (LLM classifies merge/skip). Auto-merge when confidence > 0.95; prompt user otherwise.
- [ ] **Contact Import**: Bulk import from CSV, vCard, and Google Contacts. Map columns to contact fields with preview before commit.
- [ ] **Contact Export**: Export filtered contact lists to CSV.

## Technical Design

### Components

```
src/
  modules/
    contacts/
      components/
        ContactList.tsx          # Searchable, filterable contact table
        ContactDetail.tsx        # Full contact profile with interaction timeline
        ContactForm.tsx          # Create/edit contact form
        NetworkGraph.tsx         # @xyflow/react graph visualization
        IntroPathModal.tsx       # Warm intro path finder results
        DuplicateReview.tsx      # Side-by-side duplicate merge UI
        RelationshipScoreBadge.tsx
        InteractionTimeline.tsx
        EnrichmentStatus.tsx
      hooks/
        useContacts.ts           # Contact CRUD queries (TanStack Query)
        useNetworkGraph.ts       # Graph data fetching and layout computation
        useIntroPath.ts          # Warm intro path query
        useRelationshipScore.ts
      api/
        contacts.router.ts      # tRPC or Next.js API routes
        enrichment.worker.ts    # Background enrichment job (Inngest/cron)
        dedup.worker.ts         # De-duplication pipeline worker
        suggestions.worker.ts   # AI relationship suggestion generator
      lib/
        scoring.ts              # Relationship score computation
        fuzzyMatch.ts           # Fuzzy matching utilities
        graphLayout.ts          # Graph clustering and layout algorithms
      types/
        contact.types.ts
```

### Data Model

```sql
-- Core contact table
CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  first_name    VARCHAR(255) NOT NULL,
  last_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(50),
  company       VARCHAR(255),
  title         VARCHAR(255),
  linkedin_url  VARCHAR(500),
  location      VARCHAR(255),
  bio           TEXT,
  photo_url     VARCHAR(500),
  tags          TEXT[] DEFAULT '{}',
  source        VARCHAR(50) DEFAULT 'manual', -- manual, import, enrichment
  enrichment_status VARCHAR(20) DEFAULT 'pending', -- pending, enriched, failed, stale
  enriched_at   TIMESTAMPTZ,
  relationship_score NUMERIC(5,2) DEFAULT 0,
  score_updated_at TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fund_id, email)
);

CREATE INDEX idx_contacts_fund ON contacts(fund_id);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_contacts_score ON contacts(relationship_score DESC);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX idx_contacts_name_trgm ON contacts USING GIN(
  (first_name || ' ' || last_name) gin_trgm_ops
);

-- Contact-to-contact relationship edges
CREATE TABLE contact_connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_a_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  contact_b_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50), -- colleague, co-investor, founder-investor, friend, board-member
  strength      NUMERIC(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_a_id, contact_b_id),
  CHECK(contact_a_id < contact_b_id) -- canonical ordering to prevent duplicates
);

CREATE INDEX idx_connections_a ON contact_connections(contact_a_id);
CREATE INDEX idx_connections_b ON contact_connections(contact_b_id);

-- Interaction log
CREATE TABLE interactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id       UUID REFERENCES deals(id),
  company_id    UUID REFERENCES companies(id),
  type          VARCHAR(20) NOT NULL, -- meeting, email, call, note, introduction
  summary       TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  participants  UUID[] DEFAULT '{}', -- additional contact IDs involved
  metadata      JSONB DEFAULT '{}',
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_contact ON interactions(contact_id, occurred_at DESC);
CREATE INDEX idx_interactions_deal ON interactions(deal_id);

-- Duplicate candidates
CREATE TABLE duplicate_candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_a_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  contact_b_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  similarity    NUMERIC(4,3) NOT NULL, -- 0.000 to 1.000
  ai_confidence NUMERIC(4,3),
  status        VARCHAR(20) DEFAULT 'pending', -- pending, merged, dismissed
  resolved_by   UUID REFERENCES users(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_a_id, contact_b_id)
);

-- AI relationship suggestions
CREATE TABLE relationship_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  suggestion    TEXT NOT NULL,
  reason        TEXT NOT NULL,
  priority      VARCHAR(10) DEFAULT 'medium', -- high, medium, low
  status        VARCHAR(20) DEFAULT 'active', -- active, dismissed, acted
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Warm Intro Path Finder -- Recursive CTE:**

```sql
WITH RECURSIVE intro_path AS (
  -- Base case: direct connections of the source contact
  SELECT
    contact_b_id AS current_contact,
    ARRAY[source_id, contact_b_id] AS path,
    1 AS depth
  FROM contact_connections
  WHERE contact_a_id = :source_id

  UNION ALL

  SELECT
    cc.contact_b_id,
    ip.path || cc.contact_b_id,
    ip.depth + 1
  FROM intro_path ip
  JOIN contact_connections cc
    ON cc.contact_a_id = ip.current_contact
  WHERE ip.depth < 3
    AND cc.contact_b_id != ALL(ip.path) -- prevent cycles
)
SELECT path, depth
FROM intro_path
WHERE current_contact = :target_id
ORDER BY depth ASC;
```

Note: The query is run bidirectionally (swapping a/b) due to the canonical ordering constraint on contact_connections.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/contacts` | List contacts with pagination, filtering, sorting |
| POST | `/api/contacts` | Create a new contact |
| GET | `/api/contacts/:id` | Get contact detail with recent interactions |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Soft-delete contact |
| POST | `/api/contacts/import` | Bulk import contacts (CSV, vCard) |
| GET | `/api/contacts/export` | Export contacts to CSV |
| GET | `/api/contacts/:id/interactions` | List interactions for a contact |
| POST | `/api/contacts/:id/interactions` | Log a new interaction |
| GET | `/api/contacts/:id/network` | Get ego-network graph data (N-degree) |
| GET | `/api/contacts/intro-path` | Find warm intro paths (query: source_id, target_id) |
| POST | `/api/contacts/connections` | Create a connection between two contacts |
| DELETE | `/api/contacts/connections/:id` | Remove a connection |
| GET | `/api/contacts/duplicates` | List pending duplicate candidates |
| POST | `/api/contacts/duplicates/:id/merge` | Merge duplicate pair |
| POST | `/api/contacts/duplicates/:id/dismiss` | Dismiss duplicate candidate |
| GET | `/api/contacts/suggestions` | List AI relationship suggestions for current user |
| POST | `/api/contacts/suggestions/:id/dismiss` | Dismiss a suggestion |
| POST | `/api/contacts/:id/enrich` | Trigger manual enrichment for a contact |

### AI Integration

1. **Relationship Suggestions Engine**
   - Nightly cron job (via Inngest or Vercel Cron) queries external signals:
     - LinkedIn profile changes (job title, company)
     - Crunchbase funding events for contacts' companies
     - Internal signals: deal stage changes involving contact's company
   - LLM prompt generates a natural-language suggestion with reason.
   - Suggestions stored in `relationship_suggestions` table and surfaced in notification center.

2. **De-duplication AI Confirmation**
   - Fuzzy matching pipeline runs weekly, producing candidate pairs.
   - Pairs with similarity > 0.7 and < 0.95 are sent to LLM with both contact profiles.
   - LLM returns a structured response: `{ "action": "merge" | "skip", "confidence": 0.0-1.0, "reasoning": "..." }`.
   - Auto-merge at confidence > 0.95; queue for human review otherwise.

3. **Contact Enrichment**
   - When enrichment data is sparse, LLM summarizes available web data into a concise bio.
   - Entity extraction from interaction notes to auto-tag contacts with relevant topics.

## UI/UX

### Contact List View
- Table with columns: Name, Company, Title, Relationship Score (color-coded badge), Last Interaction, Tags.
- Filters sidebar: company, tag, score range, last interaction date range, source.
- Search bar with typeahead (fuzzy search on name, company, email).
- Bulk actions: tag, export, delete.

### Contact Detail View
- Header: photo, name, title, company, score badge, enrichment status indicator.
- Tabs: Overview | Interactions | Network | Documents.
- Overview: contact fields, tags, linked deals/companies, AI suggestions.
- Interactions: chronological timeline with type icons, expandable summaries.
- Network: ego-network graph (1-2 degree), clickable nodes navigate to contact detail.

### Network Graph View
- Full-screen @xyflow/react canvas.
- Nodes: contacts (size proportional to relationship score, color by cluster).
- Edges: connections (thickness proportional to strength).
- Layout modes: force-directed (default), clustered by company, clustered by tag.
- Toolbar: zoom, fit, layout toggle, search within graph, filter by relationship type.
- Click node: popover with contact summary + "View Profile" / "Find Intro Path" actions.
- Intro path highlight: selected path edges glow, intermediate nodes labeled with relationship context.

### Duplicate Review View
- Card-based layout showing side-by-side comparison of candidate pairs.
- Highlight differences in red, matches in green.
- Actions per pair: Merge (choose primary), Dismiss.
- AI confidence score shown as a progress indicator.

## Acceptance Criteria

- [ ] Contacts can be created, viewed, edited, deleted, and searched with sub-200ms response times for lists up to 10,000 contacts.
- [ ] Relationship scores are computed correctly using the frequency x recency x depth formula and update within 1 hour of a new interaction being logged.
- [ ] Network graph renders up to 500 nodes smoothly at 60fps with clustered and ego-network layouts.
- [ ] Warm intro path finder returns all shortest paths (max depth 3) within 500ms for a network of 10,000 contacts.
- [ ] Auto-enrichment runs for new contacts within 15 minutes of creation, respecting rate limits.
- [ ] AI relationship suggestions are generated nightly and appear in the notification center by 9am.
- [ ] Duplicate detection pipeline identifies true duplicates with precision > 0.90 and recall > 0.85.
- [ ] Contact import handles CSV files up to 10,000 rows with validation errors reported per row.
- [ ] All contact data is scoped to fund_id; no cross-fund data leakage.
- [ ] Interaction logging supports all five types with correct linkage to deals, companies, and participants.

## Out of Scope

- Real-time email integration (Gmail/Outlook sync) -- planned for a future spec.
- Calendar integration for automatic interaction logging.
- Contact permissions (view/edit per contact) -- fund-level access control from Spec 1 applies.
- Mobile-optimized network graph (desktop-first for this iteration).
- Social media monitoring beyond LinkedIn and Crunchbase.
- Graph analytics (centrality, betweenness) -- may be added in a future iteration.
