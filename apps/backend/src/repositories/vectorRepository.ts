import { QdrantClient } from "@qdrant/js-client-rest";
import type { Chunk } from "@pdf-rag/shared";

const COLLECTION = "pdf_chunks";

export class VectorRepository {
  constructor(private readonly client: QdrantClient) {}

  async ensureCollection(vectorSize: number) {
    try {
      await this.client.getCollection(COLLECTION);
    } catch {
      await this.client.createCollection(COLLECTION, {
        vectors: { size: vectorSize, distance: "Cosine" }
      });
      await this.client.createPayloadIndex(COLLECTION, {
        field_name: "documentId",
        field_schema: "keyword"
      });
    }
  }

  async upsertChunks(chunks: Chunk[], vectors: number[][], filename: string) {
    await this.client.upsert(COLLECTION, {
      wait: true,
      points: chunks.map((chunk, idx) => ({
        id: chunk.chunkId,
        vector: vectors[idx],
        payload: { ...chunk, filename }
      }))
    });
  }

  async searchByVector(documentId: string, vector: number[], topK: number) {
    return this.client.search(COLLECTION, {
      vector,
      limit: topK,
      filter: {
        must: [{ key: "documentId", match: { value: documentId } }]
      },
      with_payload: true
    });
  }
}
