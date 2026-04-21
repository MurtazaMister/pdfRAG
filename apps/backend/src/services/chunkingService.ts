import { randomUUID } from "node:crypto";
import type { Chunk } from "@pdf-rag/shared";
import type { PdfPage } from "./pdfParseService.js";

export class ChunkingService {
  chunkPages(
    pages: PdfPage[],
    options: { chunkSizeTokens: number; overlapTokens: number },
    documentId: string
  ): Chunk[] {
    const pageTokenRanges = pages
      .map((page) => ({
        pageNumber: page.pageNumber,
        tokens: page.text.split(/\s+/).filter(Boolean)
      }))
      .filter((page) => page.tokens.length > 0);

    const words = pageTokenRanges.flatMap((page) => page.tokens);
    const chunks: Chunk[] = [];
    const step = Math.max(1, options.chunkSizeTokens - options.overlapTokens);
    const ranges = pageTokenRanges.map((page) => page.tokens.length);

    const pageForToken = (tokenIdx: number): number => {
      let cursor = 0;
      for (let i = 0; i < pageTokenRanges.length; i++) {
        cursor += ranges[i];
        if (tokenIdx < cursor) return pageTokenRanges[i].pageNumber;
      }
      return pageTokenRanges.at(-1)?.pageNumber ?? 1;
    };

    for (let i = 0; i < words.length; i += step) {
      const slice = words.slice(i, i + options.chunkSizeTokens);
      if (!slice.length) continue;
      const pageNumberStart = pageForToken(i);
      const pageNumberEnd = pageForToken(i + slice.length - 1);
      chunks.push({
        chunkId: randomUUID(),
        documentId,
        pageNumberStart,
        pageNumberEnd,
        content: slice.join(" "),
        tokenCount: slice.length,
        ordinal: chunks.length
      });
      if (i + options.chunkSizeTokens >= words.length) break;
    }
    return chunks;
  }
}
