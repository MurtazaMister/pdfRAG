import type { DocumentRepository } from "../repositories/documentRepository.js";
import type { VectorRepository } from "../repositories/vectorRepository.js";
import type { ChunkingService } from "./chunkingService.js";
import type { EmbeddingService } from "./embeddingService.js";
import type { PdfParseService } from "./pdfParseService.js";

export class IngestionOrchestrator {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly pdfParseService: PdfParseService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorRepository: VectorRepository,
    private readonly chunkSizeTokens: number,
    private readonly overlapTokens: number
  ) {}

  async runIngestion(input: { documentId: string; filePath: string; filename: string }) {
    await this.documentRepository.updateDocumentStatus(input.documentId, "processing");
    try {
      const pages = await this.pdfParseService.extractPages(input.filePath);
      const chunks = this.chunkingService.chunkPages(
        pages,
        {
          chunkSizeTokens: this.chunkSizeTokens,
          overlapTokens: this.overlapTokens
        },
        input.documentId
      );
      const vectors = await this.embeddingService.embedChunks(
        chunks.map((chunk) => chunk.content)
      );
      if (vectors.length > 0) await this.vectorRepository.ensureCollection(vectors[0].length);
      await this.vectorRepository.upsertChunks(chunks, vectors, input.filename);
      await this.documentRepository.updateDocumentStatus(input.documentId, "ready", {
        pageCount: pages.length
      });
    } catch (error) {
      await this.documentRepository.updateDocumentStatus(input.documentId, "failed", {
        errorMessage: String(error)
      });
      throw error;
    }
  }
}
