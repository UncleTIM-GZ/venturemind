---
spec: 8
title: "Meeting & Document AI"
module: meeting-document-ai
status: draft
date: 2026-03-20
dependencies: [2, 3]
estimated_effort: "7 days"
---

# Spec 8: Meeting & Document AI

## Objective

Enable VC professionals to capture meeting notes and upload documents (pitch decks, term sheets, memos) with AI-powered summarization, structured extraction, semantic search, and a conversational "ask about this document" interface backed by a RAG pipeline using pgvector.

## User Stories

- As a **partner**, I want to paste or upload meeting notes and get an AI-generated summary with key points, action items, decisions, and follow-ups, so that I can quickly share outcomes with my team.
- As an **associate**, I want to upload a pitch deck and have the system automatically extract company name, sector, team, key metrics, and market size, so that I can populate deal records without manual data entry.
- As an **analyst**, I want to search across all documents using natural language queries, so that I can find relevant information even when I do not remember exact keywords.
- As a **principal**, I want to ask questions about a specific document and get answers grounded in its content, so that I can quickly review dense materials.
- As an **associate**, I want documents automatically linked to the relevant deal, company, or contact, so that all context is connected without manual tagging.
- As a **partner**, I want all uploaded documents stored securely with access controlled by fund membership, so that confidential materials remain protected.
- As an **analyst**, I want to tag documents with custom labels and filter by tag, type, and linked entity, so that I can organize the document library effectively.

## Functional Requirements

- [ ] **Meeting Note Input**: Support paste-in (rich text editor) and file upload (TXT, DOCX, PDF) for meeting notes. Store raw content and metadata (date, participants, linked deal/contact).
- [ ] **AI Summarization**: On submission, run LLM summarization that produces structured output: `{ key_points: string[], action_items: { task: string, assignee: string, due_date?: string }[], decisions: string[], follow_ups: string[] }`. Display in a formatted card alongside the raw notes.
- [ ] **Pitch Deck Upload**: Upload PDF/PPTX files to Vercel Blob storage. Extract text from each slide. Run AI analysis to extract: company name, sector/industry, founding team members, key metrics (ARR, MRR, growth rate, burn rate), market size (TAM/SAM/SOM), business model, competitive landscape, and ask/use of funds.
- [ ] **Document Storage**: All files stored in Vercel Blob with signed URLs for access. Metadata stored in Postgres. Support file types: PDF, PPTX, DOCX, TXT, PNG, JPG (for screenshots/whiteboards).
- [ ] **Document Tagging**: Manual tags (free-form + predefined: pitch-deck, term-sheet, memo, due-diligence, financials, legal) plus AI-suggested tags based on content analysis.
- [ ] **Semantic Search**: Embed all document chunks using OpenAI `text-embedding-3-small` (1536 dimensions). Store embeddings in pgvector. Search endpoint accepts natural language query, embeds it, and returns top-K results ranked by cosine similarity with snippet highlighting.
- [ ] **RAG Pipeline**: For "ask about this document" feature: retrieve top-K relevant chunks from the target document, inject into LLM context with the user's question, stream the answer back with citation references to specific chunks.
- [ ] **Document Chunking**: Split documents into chunks of ~500 tokens with 50-token overlap. Each chunk stored as a `DocumentChunk` record with embedding. Re-chunk on document update.
- [ ] **Auto-Linking**: Entity extraction (NER) on document content to identify company names, person names, and deal references. Match against existing entities in the database and create links automatically. Surface unmatched entities as suggestions for the user.
- [ ] **Document Versioning**: Track upload history per document slot. Display version history with diff summary between versions.

## Technical Design

### Components

```
src/
  modules/
    documents/
      components/
        MeetingNoteEditor.tsx     # Rich text editor for meeting note input
        MeetingSummaryCard.tsx     # Structured AI summary display
        DocumentUpload.tsx        # Drag-and-drop file upload with progress
        DocumentList.tsx          # Filterable document library table
        DocumentDetail.tsx        # Document viewer with metadata sidebar
        DocumentChat.tsx          # "Ask about this document" chat interface
        PitchDeckAnalysis.tsx     # Extracted pitch deck data display
        SemanticSearchBar.tsx     # Natural language search with results
        TagManager.tsx            # Tag input and suggestion component
        ChunkViewer.tsx           # Debug/admin view of document chunks
      hooks/
        useDocuments.ts           # Document CRUD queries
        useMeetingNotes.ts        # Meeting note specific operations
        useSemanticSearch.ts      # Semantic search query hook
        useDocumentChat.ts        # RAG chat streaming hook
        useDocumentUpload.ts      # File upload with progress tracking
      api/
        documents.router.ts      # Document CRUD API routes
        meeting-notes.router.ts  # Meeting note API routes
        search.router.ts         # Semantic search endpoint
        chat.router.ts           # RAG chat endpoint (streaming)
      workers/
        embedding.worker.ts      # Chunking + embedding pipeline (Inngest)
        extraction.worker.ts     # AI extraction (summary, pitch deck analysis)
        linking.worker.ts        # Entity extraction and auto-linking
      lib/
        chunker.ts               # Document text chunking utility
        embeddings.ts            # OpenAI embedding API wrapper
        textExtractor.ts         # PDF/DOCX/PPTX text extraction
        ragPipeline.ts           # RAG retrieval + prompt construction
      types/
        document.types.ts
```

### Data Model

```sql
-- Documents table
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id       UUID NOT NULL REFERENCES funds(id),
  title         VARCHAR(500) NOT NULL,
  type          VARCHAR(30) NOT NULL, -- meeting-note, pitch-deck, term-sheet, memo, due-diligence, financials, legal, other
  file_url      VARCHAR(1000),        -- Vercel Blob signed URL base
  file_name     VARCHAR(500),
  file_size     INTEGER,              -- bytes
  mime_type     VARCHAR(100),
  raw_content   TEXT,                 -- extracted full text
  tags          TEXT[] DEFAULT '{}',
  version       INTEGER DEFAULT 1,
  status        VARCHAR(20) DEFAULT 'processing', -- processing, ready, failed
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_fund ON documents(fund_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

-- Document chunks for RAG
CREATE TABLE document_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index   INTEGER NOT NULL,
  content       TEXT NOT NULL,
  token_count   INTEGER NOT NULL,
  embedding     vector(1536),          -- pgvector column
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Meeting notes (extends documents)
CREATE TABLE meeting_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  meeting_date  TIMESTAMPTZ NOT NULL,
  participants  UUID[] DEFAULT '{}',   -- contact IDs
  deal_id       UUID REFERENCES deals(id),
  company_id    UUID REFERENCES companies(id),
  summary       JSONB,                 -- structured AI summary
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meeting_notes_document ON meeting_notes(document_id);
CREATE INDEX idx_meeting_notes_deal ON meeting_notes(deal_id);

-- Pitch deck analysis results
CREATE TABLE pitch_deck_analyses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  company_name  VARCHAR(255),
  sector        VARCHAR(255),
  team_members  JSONB DEFAULT '[]',    -- [{ name, role, background }]
  metrics       JSONB DEFAULT '{}',    -- { arr, mrr, growth_rate, burn_rate, runway_months }
  market_size   JSONB DEFAULT '{}',    -- { tam, sam, som, currency }
  business_model TEXT,
  competitive_landscape TEXT,
  ask_amount    NUMERIC(15,2),
  ask_currency  VARCHAR(3) DEFAULT 'USD',
  use_of_funds  TEXT,
  ai_confidence NUMERIC(4,3),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pitch_analysis_document ON pitch_deck_analyses(document_id);

-- Document-entity links (auto and manual)
CREATE TABLE document_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  entity_type   VARCHAR(20) NOT NULL,  -- deal, company, contact
  entity_id     UUID NOT NULL,
  link_source   VARCHAR(20) DEFAULT 'auto', -- auto, manual
  confidence    NUMERIC(4,3),          -- for auto-links
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, entity_type, entity_id)
);

CREATE INDEX idx_doc_links_document ON document_links(document_id);
CREATE INDEX idx_doc_links_entity ON document_links(entity_type, entity_id);

-- Document versions
CREATE TABLE document_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL,
  file_url      VARCHAR(1000),
  file_name     VARCHAR(500),
  file_size     INTEGER,
  change_summary TEXT,
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version)
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/documents` | List documents with filters (type, tags, linked entity, date range) |
| POST | `/api/documents` | Upload a new document (multipart form) |
| GET | `/api/documents/:id` | Get document detail with metadata, links, and analysis |
| PUT | `/api/documents/:id` | Update document metadata (title, tags) |
| DELETE | `/api/documents/:id` | Soft-delete document and associated chunks |
| GET | `/api/documents/:id/chunks` | List chunks for a document (admin/debug) |
| POST | `/api/documents/:id/reprocess` | Re-run chunking, embedding, and extraction |
| GET | `/api/documents/:id/versions` | List version history |
| POST | `/api/documents/:id/versions` | Upload a new version |
| POST | `/api/meeting-notes` | Create a meeting note (paste or upload) |
| GET | `/api/meeting-notes/:id` | Get meeting note with AI summary |
| PUT | `/api/meeting-notes/:id` | Update meeting note content (triggers re-summarization) |
| GET | `/api/meeting-notes/:id/summary` | Get or regenerate the AI summary |
| POST | `/api/documents/search` | Semantic search across all documents (body: { query, filters?, top_k? }) |
| POST | `/api/documents/:id/chat` | RAG chat: ask a question about a specific document (streaming SSE response) |
| GET | `/api/documents/:id/links` | List auto-detected and manual entity links |
| POST | `/api/documents/:id/links` | Manually link document to an entity |
| DELETE | `/api/documents/:id/links/:link_id` | Remove a document-entity link |
| GET | `/api/pitch-decks/:document_id/analysis` | Get pitch deck AI analysis results |
| POST | `/api/pitch-decks/:document_id/reanalyze` | Re-run pitch deck AI analysis |

### AI Integration

1. **Meeting Summarization Pipeline**
   - Input: raw meeting note text + metadata (participants, deal context).
   - System prompt instructs the LLM to output structured JSON with key_points, action_items (with assignee and optional due_date), decisions, and follow_ups.
   - Model: GPT-4o or Claude Sonnet via Vercel AI SDK's `generateObject` with Zod schema validation.
   - Fallback: if structured generation fails, retry once with simplified prompt; store raw summary text.

2. **Pitch Deck Analysis Pipeline**
   - Text extracted per slide using `pdf-parse` (PDF) or `mammoth`/`pptx-parser` (PPTX).
   - Concatenated text sent to LLM with extraction prompt specifying all target fields.
   - Model outputs structured JSON validated against Zod schema.
   - Low-confidence extractions (< 0.7) are flagged for human review in the UI.

3. **RAG Pipeline (Ask About This Document)**
   - User submits a question scoped to a document.
   - Embed the question using `text-embedding-3-small`.
   - Query pgvector for top-8 chunks from that document by cosine similarity.
   - Construct prompt: system instructions + retrieved chunks (with chunk indices as citation markers) + user question.
   - Stream response via Vercel AI SDK `streamText`. Include citation references `[chunk N]` in the output.
   - Client renders citations as clickable links that highlight the source chunk.

4. **Document Chunking & Embedding Pipeline**
   - Triggered asynchronously after document upload (via Inngest event).
   - Text extraction -> sentence-aware chunking (~500 tokens, 50-token overlap) -> batch embedding (OpenAI batch API, max 2048 chunks per request) -> upsert into `document_chunks`.
   - Processing status tracked on the document record (processing -> ready | failed).
   - Average processing time target: < 30 seconds for a 50-page document.

5. **Entity Extraction & Auto-Linking**
   - Run NER (via LLM or spaCy) on document text to extract company names, person names, and deal-related terms.
   - Match extracted entities against existing records in the database using fuzzy search.
   - Create `document_links` with confidence scores. High-confidence links (> 0.9) applied automatically; others surfaced as suggestions.

## UI/UX

### Meeting Note Editor
- Split-pane layout: left side is a rich text editor (Tiptap-based) for note input; right side shows the AI-generated structured summary once processed.
- Top bar: meeting date picker, participant selector (search contacts), link to deal/company.
- Action items displayed as checkboxes that can be converted to tasks (Spec 9 integration).
- Upload button for importing note files (DOCX, PDF, TXT).

### Document Library
- Grid/list toggle view. Grid shows thumbnail preview (generated from first page); list shows metadata columns.
- Columns: Title, Type (icon badge), Tags, Linked Entities, Uploaded By, Date, Status.
- Filters: type dropdown, tag multi-select, date range, linked entity search, status.
- Global semantic search bar at the top with instant results as a dropdown overlay.

### Document Detail View
- Left panel: document viewer (PDF.js for PDFs, rendered slides for PPTX, formatted text for others).
- Right panel tabs: Summary | Analysis | Links | Chat.
- Summary tab: AI-generated summary or pitch deck analysis card.
- Analysis tab (pitch decks): structured data display with editable fields for corrections.
- Links tab: list of auto-detected and manual entity links with add/remove controls.
- Chat tab: conversational interface to ask questions about the document with streaming responses and chunk citations.

### Semantic Search Results
- Results displayed as cards with: document title, type badge, relevance score, matching chunk snippet with highlighted terms, linked entities.
- Click a result to navigate to the document detail view scrolled to the matching section.

## Acceptance Criteria

- [ ] Meeting notes can be created via paste or file upload, and AI summaries are generated within 10 seconds for notes up to 5,000 words.
- [ ] AI summaries consistently extract action items with assignees when mentioned in the text (accuracy > 85% on test set).
- [ ] Pitch deck upload supports PDF and PPTX up to 50MB. Analysis completes within 30 seconds and extracts company name correctly > 95% of the time.
- [ ] Documents are stored in Vercel Blob with signed URLs that expire after 1 hour. No public access to document files.
- [ ] Semantic search returns relevant results for natural language queries with mean reciprocal rank > 0.7 on a test query set.
- [ ] RAG "ask about this document" returns answers grounded in the document content with correct citations. Hallucination rate < 5% on test questions.
- [ ] Document chunking and embedding completes within 30 seconds for documents up to 50 pages.
- [ ] Auto-linking correctly identifies and links entities with precision > 0.85.
- [ ] All document access is scoped to fund_id; no cross-fund document leakage.
- [ ] Document versioning tracks all uploads with version numbers and allows viewing any historical version.

## Out of Scope

- Real-time collaborative editing of meeting notes (single-author for this iteration).
- OCR for image-based PDFs (scanned documents) -- planned for a future iteration.
- Audio/video recording and transcription of meetings.
- Integration with note-taking apps (Notion, Roam, Obsidian).
- Cross-document RAG (querying across multiple documents simultaneously) -- single-document scope for this iteration.
- Automated term sheet comparison and redlining.
