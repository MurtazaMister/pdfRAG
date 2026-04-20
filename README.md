# PDF RAG

PDF RAG is a full-stack monorepo for uploading PDF documents, indexing their contents into a vector database, and asking grounded questions over those documents.

## What this project does

- Uploads PDFs to the backend
- Extracts and chunks PDF text
- Creates embeddings with OpenAI
- Stores vectors in Qdrant
- Answers questions using retrieved document context

## Tech stack

- Frontend: Next.js + TypeScript
- Backend: Fastify + TypeScript
- Vector database: Qdrant
- AI provider: OpenAI (embeddings + chat/response models)

## Monorepo structure

- `apps/frontend`: Next.js UI
- `apps/backend`: Fastify API and ingestion pipeline
- `packages/shared`: shared schemas/types used by frontend and backend

## Local setup

1. Clone the repo and open it in your terminal.
2. Install dependencies:
   - `corepack enable`
   - `pnpm install`
3. Create env file:
   - Copy `.env.example` to `.env`
4. Fill required values in `.env`:
   - `OPENAI_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY` (if your cluster requires auth)
   - Optional: `NEXT_PUBLIC_API_BASE` (defaults to `http://localhost:4000`)
5. Start backend:
   - `pnpm --filter @pdf-rag/backend dev`
6. Start frontend:
   - `pnpm --filter @pdf-rag/frontend dev`
7. Open:
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:4000/health`

## API endpoints

- `POST /v1/documents/upload`
- `GET /v1/documents/:documentId/status`
- `POST /v1/chat/ask`
- `POST /v1/chat/ask/stream`
- `GET /health`

## Useful scripts

- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:e2e`
