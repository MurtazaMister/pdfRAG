import type { RetrievedChunk } from "./retrievalService.js";

export class RerankService {
  rerankChunks(_question: string, chunks: RetrievedChunk[]): RetrievedChunk[] {
    return [...chunks].sort((a, b) => b.score - a.score);
  }
}
