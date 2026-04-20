import { describe, expect, it } from "vitest";
import { ChunkingService } from "./chunkingService.js";

describe("ChunkingService", () => {
  it("creates overlapping chunks with deterministic ordinal", () => {
    const service = new ChunkingService();
    const pages = [{ pageNumber: 1, text: "a b c d e f g h i j" }];
    const chunks = service.chunkPages(
      pages,
      { chunkSizeTokens: 4, overlapTokens: 1 },
      "doc1"
    );
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].ordinal).toBe(0);
    expect(chunks[1].ordinal).toBe(1);
  });
});
