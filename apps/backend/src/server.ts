import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { loadEnv, type AppConfig } from "./config/env.js";
import { registerErrorHandler } from "./plugins/errorHandler.js";
import { DocumentRepository } from "./repositories/documentRepository.js";
import { VectorRepository } from "./repositories/vectorRepository.js";
import { UploadService } from "./services/uploadService.js";
import { PdfParseService } from "./services/pdfParseService.js";
import { ChunkingService } from "./services/chunkingService.js";
import { EmbeddingService } from "./services/embeddingService.js";
import { IngestionOrchestrator } from "./services/ingestionOrchestrator.js";
import { IngestionQueue } from "./jobs/ingestionQueue.js";
import { RetrievalService } from "./services/retrievalService.js";
import { RerankService } from "./services/rerankService.js";
import { AnswerService } from "./services/answerService.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerDocumentRoutes } from "./routes/documents.js";
import { registerChatRoutes } from "./routes/chat.js";

export type AppServices = ReturnType<typeof createServices>;

function createServices(config: AppConfig) {
  const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  const qdrant = new QdrantClient({
    url: config.QDRANT_URL,
    apiKey: config.QDRANT_API_KEY || undefined
  });
  const documentRepository = new DocumentRepository();
  const vectorRepository = new VectorRepository(qdrant);
  const uploadService = new UploadService(config.MAX_UPLOAD_MB);
  const pdfParseService = new PdfParseService();
  const chunkingService = new ChunkingService();
  const embeddingService = new EmbeddingService(openai, config.OPENAI_EMBED_MODEL);
  const ingestionOrchestrator = new IngestionOrchestrator(
    documentRepository,
    pdfParseService,
    chunkingService,
    embeddingService,
    vectorRepository,
    config.CHUNK_SIZE_TOKENS,
    config.CHUNK_OVERLAP_TOKENS
  );
  const ingestionQueue = new IngestionQueue(ingestionOrchestrator);
  const retrievalService = new RetrievalService(embeddingService, vectorRepository);
  const rerankService = new RerankService();
  const answerService = new AnswerService(openai, config.OPENAI_CHAT_MODEL);
  return {
    config,
    documentRepository,
    uploadService,
    ingestionQueue,
    retrievalService,
    rerankService,
    answerService
  };
}

export function buildServer(config: AppConfig) {
  const app = Fastify({ logger: true });
  const services = createServices(config);
  const corsOrigin = config.FRONTEND_ORIGIN === "*" ? true : config.FRONTEND_ORIGIN;

  app.decorate("services", services);
  app.register(cors, { origin: corsOrigin });
  app.register(multipart);
  registerErrorHandler(app);
  registerHealthRoutes(app);
  registerDocumentRoutes(app);
  registerChatRoutes(app);
  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    services: AppServices;
  }
}

const isMain = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");
if (isMain) {
  const config = loadEnv();
  const app = buildServer(config);
  app.listen({ port: config.BACKEND_PORT, host: "0.0.0.0" });
}
