import { randomUUID } from "node:crypto";
import type { Chunk } from "@pdf-rag/shared";
import type { PdfPage } from "./pdfParseService.js";

export class ChunkingService {
  chunkPages(
    pages: PdfPage[],
    options: { chunkSizeTokens: number; overlapTokens: number },
    documentId: string
  ): Chunk[] {
    const fullText = pages.map((p) => p.text).join("\n");
    const words = fullText.split(/\s+/).filter(Boolean);
    const chunks: Chunk[] = [];
    const step = Math.max(1, options.chunkSizeTokens - options.overlapTokens);

    for (let i = 0; i < words.length; i += step) {
      const slice = words.slice(i, i + options.chunkSizeTokens);
      if (!slice.length) continue;
      chunks.push({
        chunkId: randomUUID(),
        documentId,
        pageNumberStart: 1,
        pageNumberEnd: 1,
        content: slice.join(" "),
        tokenCount: slice.length,
        ordinal: chunks.length
      });
      if (i + options.chunkSizeTokens >= words.length) break;
    }
    return chunks;
  }
}
