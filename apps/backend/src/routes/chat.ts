import type { FastifyInstance } from "fastify";
import { AskRequestSchema } from "@pdf-rag/shared";
import { AppError } from "../lib/errors.js";

export function registerChatRoutes(app: FastifyInstance) {
  app.post("/v1/chat/ask", async (request) => {
    const body = AskRequestSchema.parse(request.body);
    const doc = await app.services.documentRepository.getDocumentById(body.documentId);
    if (!doc) throw new AppError("DOCUMENT_NOT_FOUND", "Document not found.", 404);
    if (doc.status !== "ready") {
      throw new AppError("DOCUMENT_NOT_READY", "Document is not ready.", 409);
    }

    const topK = body.topK ?? app.services.config.DEFAULT_TOP_K;
    const retrieved = await app.services.retrievalService.retrieveRelevantChunks({
      documentId: body.documentId,
      question: body.question,
      topK
    });
    const chunks =
      body.rerank ?? app.services.config.ENABLE_RERANK
        ? app.services.rerankService.rerankChunks(body.question, retrieved)
        : retrieved;
    const answer = await app.services.answerService.generateAnswerNonStream({
      question: body.question,
      chunks
    });
    return { ...answer, citations: chunks };
  });

  app.post("/v1/chat/ask/stream", async (request, reply) => {
    const body = AskRequestSchema.parse(request.body);
    const doc = await app.services.documentRepository.getDocumentById(body.documentId);
    if (!doc) throw new AppError("DOCUMENT_NOT_FOUND", "Document not found.", 404);
    if (doc.status !== "ready") {
      throw new AppError("DOCUMENT_NOT_READY", "Document is not ready.", 409);
    }

    const retrieved = await app.services.retrievalService.retrieveRelevantChunks({
      documentId: body.documentId,
      question: body.question,
      topK: body.topK ?? app.services.config.DEFAULT_TOP_K
    });
    const chunks =
      body.rerank ?? app.services.config.ENABLE_RERANK
        ? app.services.rerankService.rerankChunks(body.question, retrieved)
        : retrieved;

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    for await (const evt of app.services.answerService.generateAnswerStream({
      question: body.question,
      chunks
    })) {
      if ("token" in evt) {
        reply.raw.write(`event: token\ndata: ${JSON.stringify({ token: evt.token })}\n\n`);
      } else {
        reply.raw.write(`event: citations\ndata: ${JSON.stringify({ citations: chunks })}\n\n`);
        reply.raw.write(`event: done\ndata: ${JSON.stringify({ usage: evt.usage })}\n\n`);
      }
    }
    reply.raw.end();
    return reply;
  });
}
