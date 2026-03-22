---
spec: 6
title: "LP Portal & Reporting"
module: lp-portal-reporting
status: draft
date: 2026-03-20
dependencies: [2, 5]
estimated_effort: "8 days"
---

# Spec 6: LP Portal & Reporting

## Objective

Provide a secure, LP-facing portal with AI-generated quarterly reports, capital call and distribution notices, fund performance visualization, and a zero-trust document data room, enabling fund managers to maintain transparent and efficient LP communications.

## User Stories

- As an **LP**, I want to log in to a dedicated portal and see only my fund's performance data, so that I have a clear view of my investment without seeing other LPs' information.
- As a **fund manager**, I want to generate quarterly reports using AI, so that I can produce comprehensive narratives from portfolio data in minutes.
- As a **CFO**, I want to generate capital call and distribution notices as PDF documents, so that I can send professional, compliant notices to LPs.
- As a **partner**, I want to review and approve reports before they are published to LPs, so that all LP-facing content is vetted.
- As an **LP**, I want to view fund performance with waterfall charts, so that I can understand how returns are distributed.
- As an **LP**, I want to search through historical reports, so that I can reference past communications and track fund progress over time.
- As a **fund manager**, I want to share documents securely with specific LPs via a data room, so that sensitive materials are only accessible to authorized parties.
- As a **compliance officer**, I want per-LP data scoping with zero-trust enforcement, so that no LP can access another LP's data or documents.

## Functional Requirements

- [ ] LP-facing portal served on a configurable subdomain (e.g., `lp.venturemind.co`) with separate authentication
- [ ] LP authentication via Clerk with separate organization or custom auth integration supporting SSO
- [ ] Zero-trust LP data scoping: every query enforced at the database level to return only the authenticated LP's data
- [ ] Quarterly report AI drafting using DurableAgent workflow with multi-step generation
- [ ] Report approval workflow: draft -> partner review -> approve -> publish (with email notifications at each stage)
- [ ] Capital call notice generation with PDF output including fund terms, call amount, LP allocation, due date, and wire instructions
- [ ] Distribution notice generation with PDF output including distribution amount, LP share, and tax information references
- [ ] Fund performance dashboard with waterfall charts showing GP carry, LP preferred return, and return splits
- [ ] Historical report archive with full-text search across all published reports
- [ ] LP data room: secure folder structure with document upload, per-LP access control, and time-limited signed URLs
- [ ] Document access audit log: every view and download is recorded
- [ ] LP notification system: email alerts when new reports or documents are published

## Technical Design

### Components

```
src/
  modules/
    lp-portal/
      components/
        LPDashboard.tsx              # LP landing page with fund summary
        FundPerformancePanel.tsx      # IRR, TVPI, DPI, RVPI display for LP's view
        WaterfallChart.tsx            # Waterfall chart (Recharts) for return distribution
        ReportList.tsx               # Paginated list of published quarterly reports
        ReportViewer.tsx             # Full report reader with PDF download
        ReportSearchBar.tsx          # Full-text search across historical reports
        CapitalCallNotice.tsx        # Capital call detail view
        DistributionNotice.tsx       # Distribution detail view
        DataRoomBrowser.tsx          # Folder/file browser for data room documents
        DataRoomUploader.tsx         # Drag-and-drop document upload with LP assignment
      hooks/
        useLPAuth.ts                 # LP-specific auth context and scoping
        useLPReports.ts              # Query published reports for authenticated LP
        useFundPerformance.ts        # Fund metrics scoped to LP's commitments
        useDataRoom.ts               # Data room file listing and signed URL generation
      middleware/
        lpScopeMiddleware.ts         # Enforces per-LP data isolation on every request
    reporting/
      components/
        ReportDraftEditor.tsx        # Internal editor for reviewing AI-generated reports
        ReportApprovalWorkflow.tsx   # Status transition UI with approval actions
        NoticeGenerator.tsx          # Capital call / distribution PDF builder
        ReportDiffViewer.tsx         # Compare draft versions before approval
      hooks/
        useReportDrafts.ts           # Internal report management queries
        useApprovalWorkflow.ts       # Workflow state and transitions
      actions/
        generateQuarterlyReport.ts   # Server action: trigger DurableAgent for report generation
        generateNotice.ts            # Server action: PDF generation for capital call / distribution
        approveReport.ts             # Server action: transition report to approved/published
        uploadDataRoomDoc.ts         # Server action: upload to Vercel Blob with LP scoping
```

### Data Model

```sql
-- LP entities
CREATE TABLE lps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  entity_type     VARCHAR(50),               -- 'individual', 'institution', 'fund_of_funds', 'family_office'
  contact_name    VARCHAR(255),
  contact_email   VARCHAR(255),
  clerk_user_id   VARCHAR(255) UNIQUE,       -- Clerk user ID for portal auth
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- LP commitments to funds
CREATE TABLE lp_commitments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id           UUID NOT NULL REFERENCES lps(id),
  fund_id         UUID NOT NULL REFERENCES funds(id),
  commitment_amount DECIMAL(15,2) NOT NULL,
  called_amount   DECIMAL(15,2) DEFAULT 0,
  distributed_amount DECIMAL(15,2) DEFAULT 0,
  commitment_date DATE NOT NULL,
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','fully_called','redeemed')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lp_id, fund_id)
);

-- Quarterly reports
CREATE TABLE quarterly_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id         UUID NOT NULL REFERENCES funds(id),
  quarter         VARCHAR(7) NOT NULL,       -- e.g., '2026-Q1'
  title           VARCHAR(500) NOT NULL,
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','published','archived')),
  content         JSONB NOT NULL,            -- { sections: [{ title, body }], metadata: {...} }
  draft_version   INT DEFAULT 1,
  generated_by    VARCHAR(20) DEFAULT 'ai',  -- 'ai' or 'manual'
  reviewed_by     UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Report versions for diff tracking
CREATE TABLE report_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES quarterly_reports(id),
  version         INT NOT NULL,
  content         JSONB NOT NULL,
  change_notes    TEXT,
  authored_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, version)
);

-- Capital call / distribution notices
CREATE TABLE notices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id         UUID NOT NULL REFERENCES funds(id),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('capital_call','distribution')),
  title           VARCHAR(500) NOT NULL,
  total_amount    DECIMAL(15,2) NOT NULL,
  due_date        DATE,                      -- for capital calls
  notice_date     DATE NOT NULL,
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','approved','sent')),
  pdf_url         TEXT,                      -- Vercel Blob URL for generated PDF
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Per-LP notice allocations
CREATE TABLE notice_allocations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id       UUID NOT NULL REFERENCES notices(id),
  lp_id           UUID NOT NULL REFERENCES lps(id),
  amount          DECIMAL(15,2) NOT NULL,
  percentage      DECIMAL(5,4) NOT NULL,     -- LP's pro-rata share
  sent_at         TIMESTAMPTZ,
  viewed_at       TIMESTAMPTZ,
  UNIQUE(notice_id, lp_id)
);

-- LP data room documents
CREATE TABLE data_room_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id         UUID NOT NULL REFERENCES funds(id),
  folder          VARCHAR(500) DEFAULT '/',
  filename        VARCHAR(500) NOT NULL,
  file_size       BIGINT,
  mime_type       VARCHAR(100),
  blob_key        TEXT NOT NULL,             -- Vercel Blob storage key
  uploaded_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Per-LP document access grants (zero-trust scoping)
CREATE TABLE data_room_access (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES data_room_documents(id),
  lp_id           UUID NOT NULL REFERENCES lps(id),
  granted_by      UUID REFERENCES users(id),
  granted_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,               -- optional expiry
  UNIQUE(document_id, lp_id)
);

-- Document access audit log
CREATE TABLE data_room_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES data_room_documents(id),
  lp_id           UUID NOT NULL REFERENCES lps(id),
  action          VARCHAR(20) NOT NULL CHECK (action IN ('view','download')),
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index for published reports
CREATE INDEX idx_quarterly_reports_search
  ON quarterly_reports
  USING GIN (to_tsvector('english', content::text))
  WHERE status = 'published';
```

### API Endpoints

**Internal (GP-facing) Endpoints**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reports/generate` | Trigger AI quarterly report generation via DurableAgent |
| GET | `/api/reports` | List all reports with status filters |
| GET | `/api/reports/:id` | Get report detail with content |
| PUT | `/api/reports/:id` | Update report content (creates new version) |
| PATCH | `/api/reports/:id/status` | Transition report status (review/approve/publish) |
| GET | `/api/reports/:id/versions` | List report versions |
| POST | `/api/notices` | Create capital call or distribution notice |
| POST | `/api/notices/:id/generate-pdf` | Generate PDF for a notice |
| PATCH | `/api/notices/:id/send` | Mark notice as sent and trigger LP emails |
| POST | `/api/data-room/upload` | Upload document to data room |
| POST | `/api/data-room/:docId/grant` | Grant LP access to a document |
| DELETE | `/api/data-room/:docId/grant/:lpId` | Revoke LP access |
| GET | `/api/data-room/audit-log` | View document access audit log |

**LP Portal Endpoints**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lp/dashboard` | LP dashboard with fund summary (scoped) |
| GET | `/api/lp/funds/:fundId/performance` | Fund performance metrics for this LP |
| GET | `/api/lp/funds/:fundId/waterfall` | Waterfall chart data for return distribution |
| GET | `/api/lp/reports` | List published reports visible to this LP |
| GET | `/api/lp/reports/:id` | Get full report content |
| GET | `/api/lp/reports/search` | Full-text search across published reports |
| GET | `/api/lp/notices` | List notices allocated to this LP |
| GET | `/api/lp/notices/:id/pdf` | Download notice PDF (signed URL) |
| GET | `/api/lp/data-room` | List data room documents accessible to this LP |
| GET | `/api/lp/data-room/:docId/download` | Get time-limited signed URL for document download |

### AI Integration

**DurableAgent Workflow -- Quarterly Report Generation**

The quarterly report generation uses a DurableAgent durable workflow to orchestrate a multi-step AI pipeline:

```typescript
const quarterlyReportWorkflow = defineWorkflow({
  name: "quarterly-report-generation",
  steps: [
    // Step 1: Aggregate fund and portfolio data
    {
      name: "aggregate-fund-data",
      handler: async (ctx) => {
        const fundId = ctx.input.fundId;
        const quarter = ctx.input.quarter;

        const fundData = await aggregateFundData(fundId, quarter);
        // Includes: fund metrics (IRR, TVPI, DPI, RVPI), portfolio company summaries,
        // health scores, notable events, valuation changes, capital activity
        return fundData;
      }
    },
    // Step 2: Generate narrative sections
    {
      name: "generate-narrative",
      handler: async (ctx) => {
        const sections = [
          "fund_overview",
          "market_environment",
          "portfolio_highlights",
          "portfolio_company_updates",
          "fund_performance",
          "capital_activity",
          "outlook"
        ];

        const drafted = await Promise.all(
          sections.map(section => aiGateway.complete({
            model: "anthropic/claude-sonnet-4.6",
            messages: [
              { role: "system", content: QUARTERLY_REPORT_SYSTEM_PROMPT },
              { role: "user", content: buildReportSectionPrompt(section, ctx.prev) }
            ]
          }))
        );

        return { sections: drafted };
      }
    },
    // Step 3: Assemble, cross-reference, and add data tables
    {
      name: "assemble-report",
      handler: async (ctx) => {
        const assembled = await aiGateway.complete({
          model: "anthropic/claude-sonnet-4.6",
          messages: [
            { role: "system", content: "Assemble these sections into a cohesive quarterly report. Ensure consistent tone, accurate cross-references, and proper formatting." },
            { role: "user", content: JSON.stringify(ctx.prev.sections) }
          ]
        });
        return assembled;
      }
    }
  ]
});
```

**Capital Call / Distribution PDF Generation**

PDF notices are generated using @react-pdf/renderer with fund-specific branding:

```typescript
const generateNoticePDF = async (noticeId: string) => {
  const notice = await getNoticeWithAllocations(noticeId);
  const fund = await getFundDetails(notice.fundId);

  // Generate one PDF per LP with their specific allocation
  const pdfs = await Promise.all(
    notice.allocations.map(async (allocation) => {
      const pdfBuffer = await renderToBuffer(
        <NoticePDFTemplate
          fund={fund}
          notice={notice}
          allocation={allocation}
          lp={allocation.lp}
        />
      );

      // Upload to Vercel Blob with signed URL
      const blob = await put(
        `notices/${noticeId}/${allocation.lpId}.pdf`,
        pdfBuffer,
        { access: 'private' }
      );

      return { lpId: allocation.lpId, url: blob.url };
    })
  );

  return pdfs;
};
```

**Vercel Blob Signed URLs for Data Room**

Documents are served via time-limited signed URLs to enforce zero-trust access:

```typescript
const getDataRoomDownloadURL = async (docId: string, lpId: string) => {
  // Verify LP has access grant
  const access = await db.dataRoomAccess.findUnique({
    where: { document_id_lp_id: { document_id: docId, lp_id: lpId } }
  });

  if (!access) throw new ForbiddenError("Access denied");
  if (access.expires_at && access.expires_at < new Date()) {
    throw new ForbiddenError("Access expired");
  }

  const doc = await db.dataRoomDocuments.findUnique({ where: { id: docId } });

  // Generate 15-minute signed URL
  const signedUrl = await getSignedUrl(doc.blob_key, { expiresIn: 15 * 60 });

  // Log access
  await db.dataRoomAuditLog.create({
    data: { document_id: docId, lp_id: lpId, action: 'download' }
  });

  return signedUrl;
};
```

## UI/UX

### LP Portal Layout

- **Subdomain-isolated**: Served at `lp.venturemind.co` with dedicated login page and LP branding
- **Navigation**: Left sidebar with Fund Overview, Reports, Notices, Data Room, and Profile sections
- **Header**: LP entity name, fund name selector (for multi-fund LPs), and notification bell

### Fund Performance View

- **Summary cards**: Commitment amount, called capital, distributions received, current NAV, net IRR
- **Waterfall chart**: Interactive Recharts waterfall showing return of capital, preferred return, GP catch-up, and carried interest splits
- **Performance over time**: Line chart showing NAV and distributions over quarters

### Report Viewer

- **Card list**: Reports listed chronologically with quarter, title, and published date
- **Reader view**: Clean, full-width reading layout with a table of contents sidebar
- **Search**: Full-text search bar at the top of the reports list with highlighted results
- **Download**: PDF export button on each report

### Data Room

- **Folder browser**: Hierarchical folder view with breadcrumb navigation
- **Document cards**: Show filename, upload date, file size, and download button
- **Access indicators**: Badge showing "shared with you" or "fund-wide" scope

### Internal Report Management (GP View)

- **Kanban board**: Columns for Draft, In Review, Approved, Published
- **Report editor**: Rich text editor with AI generation trigger button and section-by-section editing
- **Approval actions**: "Submit for Review", "Approve", "Request Changes", and "Publish" buttons with confirmation dialogs
- **Diff viewer**: Side-by-side comparison of report versions before approval

### Notice Management

- **Notice builder**: Form to create capital call or distribution with auto-calculated LP allocations based on pro-rata commitments
- **PDF preview**: In-browser preview of generated notice before sending
- **Send workflow**: Bulk send with per-LP email delivery and read tracking

## Acceptance Criteria

- [ ] LP portal is accessible at a configurable subdomain with independent authentication
- [ ] LPs can only see data for funds they have commitments to; zero-trust scoping is enforced at the database query level
- [ ] AI-generated quarterly reports produce coherent, professional narratives covering all required sections
- [ ] Report approval workflow enforces the draft -> partner review -> approve -> publish sequence with email notifications
- [ ] Capital call notices generate correctly formatted PDFs with per-LP allocation amounts
- [ ] Distribution notices generate correctly formatted PDFs with per-LP distribution amounts
- [ ] Waterfall charts accurately visualize the fund's return distribution mechanics
- [ ] Historical report archive supports full-text search with relevant result highlighting
- [ ] Data room documents are accessible only to LPs with explicit access grants
- [ ] Document download URLs are time-limited (15-minute expiry) signed Vercel Blob URLs
- [ ] Every document view and download is recorded in the audit log with timestamp, LP ID, and IP address
- [ ] LP notifications are sent via email when new reports or documents are published
- [ ] Report versions are tracked; diffs between versions render correctly in the internal review interface

## Out of Scope

- LP self-service onboarding and account creation (admin-provisioned only)
- Electronic subscription document signing (integration with DocuSign/HelloSign)
- Tax document generation (K-1s, tax statements)
- Multi-currency support and FX conversion for international LPs
- LP co-investment deal flow and side letter management
- Real-time chat or messaging between GPs and LPs
- Custom white-labeling of the LP portal beyond logo and color configuration
- Automated regulatory reporting (Form PF, Form ADV, AIFMD Annex IV)
