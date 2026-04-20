# PDF RAG Starter

Starter monorepo implementing PDF upload, chunking, embedding into Qdrant, and question answering with OpenAI.

## Tech
- Backend: Fastify + TypeScript
- Frontend: Next.js + TypeScript
- Vector DB: Qdrant
- AI: OpenAI embeddings + responses API

## Local setup
1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
2. Install dependencies:
   - `corepack enable`
   - `pnpm install`
3. Set `QDRANT_URL` and `QDRANT_API_KEY` in `.env` for your hosted Qdrant instance.
4. Start services:
   - `pnpm --filter @pdf-rag/backend dev`
   - `pnpm --filter @pdf-rag/frontend dev`

## API
- `POST /v1/documents/upload`
- `GET /v1/documents/:documentId/status`
- `POST /v1/chat/ask`
- `POST /v1/chat/ask/stream`

## Tests
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:e2e`
