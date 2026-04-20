import type { FastifyInstance } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { AppError } from "../lib/errors.js";

export function registerDocumentRoutes(app: FastifyInstance) {
  app.post("/v1/documents/upload", async (request, reply) => {
    const file = (await request.file()) as MultipartFile | undefined;
    if (!file) throw new AppError("VALIDATION_ERROR", "Missing file part.", 400);
    const saved = await app.services.uploadService.savePdfToStorage(file);
    await app.services.documentRepository.createDocumentRecord({
      id: saved.documentId,
      filename: saved.filename,
      bytes: saved.bytes,
      mimeType: saved.mimeType,
      status: "uploaded"
    });
    app.services.ingestionQueue.enqueueIngestionJob({
      documentId: saved.documentId,
      filePath: saved.filePath,
      filename: saved.filename
    });
    return reply.code(202).send({ documentId: saved.documentId, status: "uploaded" });
  });

  app.get("/v1/documents/:documentId/status", async (request) => {
    const params = request.params as { documentId: string };
    const doc = await app.services.documentRepository.getDocumentById(params.documentId);
    if (!doc) throw new AppError("DOCUMENT_NOT_FOUND", "Document not found.", 404);
    return doc;
  });
}
