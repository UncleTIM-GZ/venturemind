---
spec: 4
title: "AI Memo & DD Engine"
module: memo-dd-engine
status: draft
date: 2026-03-20
dependencies: [2, 3]
estimated_effort: "8 days"
---

# Spec 4: AI Memo & DD Engine

## Objective

Provide a comprehensive AI-powered investment memo authoring and due diligence management system that enables investment teams to generate, iterate, and export professional-grade memos with minimal manual effort while maintaining full version control and audit trails.

## User Stories

- As an **investment analyst**, I want to generate an AI-drafted investment memo from deal data, so that I can produce a first draft in minutes instead of hours.
- As a **partner**, I want to customize memo templates per fund, so that each fund's memos follow the appropriate structure and emphasis.
- As an **associate**, I want to request targeted AI revisions like "make the risk section more conservative," so that I can iterate on specific sections without rewriting the entire memo.
- As a **deal lead**, I want to auto-generate a DD checklist based on deal type and sector, so that no critical diligence items are overlooked.
- As a **fund manager**, I want to export finalized memos to PDF and DOCX, so that I can distribute them to LPs and the investment committee.
- As an **analyst**, I want to view diffs between memo versions, so that I can track how the investment thesis evolved during diligence.
- As a **compliance officer**, I want a full audit trail of memo edits and AI interactions, so that I can demonstrate process rigor to regulators.

## Functional Requirements

- [ ] Memo template management: create, update, clone, and archive templates stored as JSON schema
- [ ] Per-fund template assignment with fallback to a global default template
- [ ] Template sections configurable with ordering, required/optional flags, and guidance prompts
- [ ] AI memo draft generation via DurableAgent multi-step workflow (4 steps, see Technical Design)
- [ ] Section-level AI revision with natural language instructions (e.g., "Make the risk section more conservative")
- [ ] Full memo regeneration with option to lock individual sections from overwrite
- [ ] DD checklist generator supporting four categories: legal, financial, technical, commercial
- [ ] DD checklist items linkable to uploaded evidence documents
- [ ] Memo versioning: every save creates an immutable version with timestamp and author
- [ ] Side-by-side diff view between any two memo versions
- [ ] Export to PDF using @react-pdf/renderer with branded fund styling
- [ ] Export to DOCX with proper heading hierarchy and table formatting
- [ ] Collaborative editing with optimistic locking (last-write-wins with conflict notification)
- [ ] Memo status workflow: draft -> in-review -> approved -> archived
- [ ] Role-based access: analysts draft, partners approve, read-only for observers
- [ ] AI interaction logging: every prompt and response stored for audit

## Technical Design

### Components

```
src/
  modules/
    memo/
      components/
        MemoEditor.tsx            # Rich text editor (Tiptap) for memo sections
        MemoTemplateBuilder.tsx   # JSON schema-driven template configurator
        MemoVersionHistory.tsx    # Version list with diff launcher
        MemoDiffViewer.tsx        # Side-by-side diff (react-diff-viewer)
        MemoExportDialog.tsx      # PDF/DOCX export options
        SectionRevisionPanel.tsx  # AI revision input per section
        MemoStatusBadge.tsx       # Draft/In-Review/Approved indicator
      hooks/
        useMemoGeneration.ts      # DurableAgent workflow trigger and polling
        useMemoVersions.ts        # Version history queries
        useMemoExport.ts          # Export generation and download
      actions/
        generateMemo.ts           # Server action: trigger DurableAgent workflow
        reviseMemoSection.ts      # Server action: AI section revision
        exportMemo.ts             # Server action: PDF/DOCX rendering
    dd/
      components/
        DDChecklistView.tsx       # Interactive checklist with progress
        DDChecklistGenerator.tsx  # AI-powered checklist creation
        DDEvidenceUpload.tsx      # Document attachment per checklist item
      hooks/
        useDDChecklist.ts
      actions/
        generateDDChecklist.ts    # Server action: AI checklist generation
```

### Data Model

```sql
-- Memo templates stored as JSON schema
CREATE TABLE memo_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id       UUID REFERENCES funds(id),
  name          VARCHAR(255) NOT NULL,
  schema        JSONB NOT NULL,          -- JSON schema defining sections, ordering, guidance
  is_default    BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  archived_at   TIMESTAMPTZ
);

-- Investment memos
CREATE TABLE memos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       UUID NOT NULL REFERENCES deals(id),
  template_id   UUID REFERENCES memo_templates(id),
  title         VARCHAR(500) NOT NULL,
  status        VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','archived')),
  current_version INT DEFAULT 1,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Immutable memo versions
CREATE TABLE memo_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id       UUID NOT NULL REFERENCES memos(id),
  version       INT NOT NULL,
  content       JSONB NOT NULL,          -- { sections: [{ key, title, body, locked }] }
  change_summary VARCHAR(1000),
  authored_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(memo_id, version)
);

-- AI interaction audit log
CREATE TABLE memo_ai_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id       UUID NOT NULL REFERENCES memos(id),
  version       INT NOT NULL,
  action        VARCHAR(50) NOT NULL,    -- 'full_generation', 'section_revision', 'checklist_generation'
  section_key   VARCHAR(100),
  prompt        TEXT NOT NULL,
  response      TEXT NOT NULL,
  model         VARCHAR(100) NOT NULL,
  tokens_used   INT,
  duration_ms   INT,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- DD checklists
CREATE TABLE dd_checklists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       UUID NOT NULL REFERENCES deals(id),
  category      VARCHAR(20) NOT NULL CHECK (category IN ('legal','financial','technical','commercial')),
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- DD checklist items
CREATE TABLE dd_checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID NOT NULL REFERENCES dd_checklists(id),
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','not_applicable')),
  assigned_to   UUID REFERENCES users(id),
  evidence_url  TEXT,                    -- Link to uploaded evidence document
  notes         TEXT,
  sort_order    INT DEFAULT 0,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/memo-templates` | List templates (filterable by fund) |
| POST | `/api/memo-templates` | Create a new template |
| PUT | `/api/memo-templates/:id` | Update template schema |
| DELETE | `/api/memo-templates/:id` | Archive a template |
| GET | `/api/deals/:dealId/memos` | List memos for a deal |
| POST | `/api/deals/:dealId/memos` | Create memo (optionally trigger AI generation) |
| GET | `/api/memos/:id` | Get current memo with latest version content |
| PUT | `/api/memos/:id` | Update memo content (creates new version) |
| PATCH | `/api/memos/:id/status` | Transition memo status |
| GET | `/api/memos/:id/versions` | List all versions |
| GET | `/api/memos/:id/versions/:v1/diff/:v2` | Compute diff between two versions |
| POST | `/api/memos/:id/generate` | Trigger full AI generation via DurableAgent |
| POST | `/api/memos/:id/revise` | AI revision of a specific section |
| POST | `/api/memos/:id/export` | Generate PDF or DOCX export |
| GET | `/api/deals/:dealId/dd-checklists` | List DD checklists for a deal |
| POST | `/api/deals/:dealId/dd-checklists/generate` | AI-generate DD checklists |
| PATCH | `/api/dd-checklist-items/:id` | Update checklist item status/evidence |

### AI Integration

**DurableAgent Workflow (Workflow DevKit) -- Multi-Step Memo Generation**

The memo generation uses a DurableAgent durable workflow to orchestrate a multi-step AI pipeline. This ensures reliability, resumability, and observability for long-running generation tasks.

```typescript
// Workflow definition (simplified)
const memoGenerationWorkflow = defineWorkflow({
  name: "memo-generation",
  steps: [
    // Step 1: Gather all deal data
    {
      name: "gather-deal-data",
      handler: async (ctx) => {
        // Fetch company profile, metrics, contacts, previous notes,
        // existing DD findings, and any prior memos
        const dealData = await gatherDealContext(ctx.input.dealId);
        return dealData;
      }
    },
    // Step 2: Research market context
    {
      name: "research-market-context",
      handler: async (ctx) => {
        // Use AI to synthesize market size, competitors, trends
        // from ingested data and any available market databases
        const marketContext = await aiGateway.complete({
          model: "anthropic/claude-sonnet-4.6",
          messages: [{ role: "user", content: buildMarketResearchPrompt(ctx.prev) }]
        });
        return { ...ctx.prev, marketContext };
      }
    },
    // Step 3: Draft each section independently
    {
      name: "draft-sections",
      handler: async (ctx) => {
        const sections = ["executive_summary", "market_analysis", "team_assessment",
                          "financial_analysis", "risk_factors", "recommendation"];
        // Draft sections in parallel where possible
        const drafted = await Promise.all(
          sections.map(section => aiGateway.complete({
            model: "anthropic/claude-sonnet-4.6",
            messages: [{ role: "user", content: buildSectionPrompt(section, ctx.prev) }]
          }))
        );
        return { sections: drafted };
      }
    },
    // Step 4: Assemble and format
    {
      name: "assemble-memo",
      handler: async (ctx) => {
        // Combine sections, ensure consistency, add cross-references
        const assembled = await aiGateway.complete({
          model: "anthropic/claude-sonnet-4.6",
          messages: [{ role: "user", content: buildAssemblyPrompt(ctx.prev.sections) }]
        });
        return assembled;
      }
    }
  ]
});
```

**Section-Level AI Revision**

Targeted revisions use a single AI Gateway call with the current section content, the revision instruction, and surrounding context for coherence:

```typescript
const reviseSection = async (memoId: string, sectionKey: string, instruction: string) => {
  const memo = await getMemoWithContext(memoId);
  const section = memo.sections.find(s => s.key === sectionKey);

  const revised = await aiGateway.complete({
    model: "anthropic/claude-sonnet-4.6",
    messages: [
      { role: "system", content: "You are revising one section of an investment memo. Maintain consistency with the overall memo tone and data." },
      { role: "user", content: `Current section:\n${section.body}\n\nInstruction: ${instruction}\n\nContext from other sections:\n${buildContextSummary(memo, sectionKey)}` }
    ]
  });

  return revised;
};
```

**DD Checklist Generation**

AI generates category-specific checklists based on deal attributes (sector, stage, geography, deal size):

```typescript
const generateDDChecklist = async (dealId: string, categories: string[]) => {
  const deal = await getDealWithProfile(dealId);

  const checklists = await aiGateway.complete({
    model: "anthropic/claude-sonnet-4.6",
    messages: [
      { role: "system", content: DD_CHECKLIST_SYSTEM_PROMPT },
      { role: "user", content: `Generate DD checklists for: ${categories.join(", ")}\n\nDeal: ${JSON.stringify(deal)}` }
    ],
    response_format: { type: "json_object" }  // Structured output
  });

  return checklists;
};
```

## UI/UX

### Memo Editor Layout

- **Left sidebar**: Section navigator with completion indicators (drafted/empty/locked)
- **Main area**: Rich text editor (Tiptap) for the active section with formatting toolbar
- **Right sidebar**: AI assistant panel -- shows generation status, revision input, and context data
- **Top bar**: Memo title, status badge, version selector dropdown, export button, and share controls

### Key Interactions

- **Generate memo**: Click "Generate with AI" on an empty memo; shows a 4-step progress indicator as the DurableAgent workflow executes (Gathering Data -> Researching Market -> Drafting Sections -> Assembling)
- **Revise section**: Select a section, type a natural language instruction in the right panel (e.g., "Make the risk section more conservative"), and click "Revise"; the AI streams the updated section with changes highlighted
- **Lock sections**: Toggle a lock icon on any section to prevent it from being overwritten during full regeneration
- **Version history**: Expandable timeline in the left sidebar; clicking any version opens the diff viewer in a modal
- **DD checklist**: Tab alongside the memo editor; shows a kanban-style board with columns per category (legal, financial, technical, commercial) and draggable items

### Export Preview

- PDF preview renders in a modal using @react-pdf/renderer with fund branding (logo, colors, fonts)
- DOCX export triggers a server-side generation and downloads immediately

## Acceptance Criteria

- [ ] Users can create and customize memo templates with configurable sections stored as JSON schema
- [ ] AI generates a complete first-draft memo from deal data via the 4-step DurableAgent workflow in under 90 seconds
- [ ] Section-level AI revision applies targeted changes without affecting other sections
- [ ] Every memo save creates an immutable version; diffs between any two versions render correctly
- [ ] DD checklists are generated with relevant items for the selected categories based on deal context
- [ ] PDF export produces a professional, branded document matching the fund's styling
- [ ] DOCX export produces a properly formatted document with correct heading hierarchy
- [ ] All AI interactions (prompts, responses, model, tokens) are logged in the audit table
- [ ] Memo status transitions enforce role-based permissions (analysts draft, partners approve)
- [ ] Locked sections are preserved during full memo regeneration
- [ ] DD checklist items can be marked complete with evidence document attachments

## Out of Scope

- Real-time collaborative editing (multi-cursor, CRDT) -- optimistic locking is used instead
- Integration with external DD platforms (e.g., Ansarada, Datasite)
- Automated data room ingestion and parsing of uploaded DD documents
- AI-generated financial models or pro-forma projections
- Integration with e-signature platforms for memo sign-off
- Natural language querying across multiple memos (cross-memo search)
