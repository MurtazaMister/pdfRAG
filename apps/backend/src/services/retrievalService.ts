import type { VectorRepository } from "../repositories/vectorRepository.js";
import type { EmbeddingService } from "./embeddingService.js";

export type RetrievedChunk = {
  chunkId: string;
  pageNumberStart: number;
  pageNumberEnd: number;
  score: number;
  textSnippet: string;
};

export class RetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorRepository: VectorRepository
  ) {}

  async retrieveRelevantChunks(input: {
    documentId: string;
    question: string;
    topK: number;
  }): Promise<RetrievedChunk[]> {
    const vector = await this.embeddingService.embedQuery(input.question);
    const points = await this.vectorRepository.searchByVector(
      input.documentId,
      vector,
      input.topK
    );
    return points.map((point) => {
      const payload = point.payload as Record<string, unknown>;
      return {
        chunkId: String(payload.chunkId ?? point.id),
        pageNumberStart: Number(payload.pageNumberStart ?? 1),
        pageNumberEnd: Number(payload.pageNumberEnd ?? 1),
        score: point.score ?? 0,
        textSnippet: String(payload.content ?? "")
      };
    });
  }
}
