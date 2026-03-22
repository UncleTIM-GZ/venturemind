---
card: 8
title: "Meeting & Document AI"
project: VentureMind
module: documents
priority: medium
status: todo
estimated_effort: "7 days"
dependencies: [2, 3]
assignee: null
tags: [meetings, documents, rag, summarization, pgvector, pitch-deck]
---

# Card 8: Meeting & Document AI

## Summary

Build the meeting notes system with AI summarization, pitch deck analysis, document semantic search (RAG), and automatic entity linking.

## Deliverables

- [ ] Meeting note input (paste or file upload)
- [ ] AI summarization: key points, action items, decisions, follow-ups
- [ ] Pitch deck upload to Vercel Blob + AI analysis
- [ ] Pitch deck extraction: company name, sector, team, metrics, market size
- [ ] Document tagging and semantic search via pgvector
- [ ] RAG pipeline: chunk → embed → store → query
- [ ] "Ask about this document" conversational interface
- [ ] Auto-link documents to deals, companies, contacts via entity extraction
- [ ] DocumentChunk entity (document_id, chunk_index, content, embedding)

## RAG Architecture

1. Upload PDF → Vercel Blob
2. Extract text (Gemini Flash multimodal for image-heavy decks)
3. Chunk into ~500 token overlapping segments
4. Embed via AI SDK `embed()` → store in pgvector
5. Query: embed question → cosine similarity → top-5 chunks → LLM answer

## Spec Reference

`docs/specs/spec-08-meeting-document-ai.md`

## Definition of Done

- Meeting notes summarize with structured output (action items extracted)
- Pitch deck analysis extracts structured data
- Document search returns relevant results via semantic similarity
- "Ask about this document" returns accurate answers from RAG
