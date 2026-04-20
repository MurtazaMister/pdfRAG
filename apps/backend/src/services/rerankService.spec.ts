import { describe, expect, it } from "vitest";
import { RerankService } from "./rerankService.js";

describe("RerankService", () => {
  it("sorts chunks by score descending", () => {
    const service = new RerankService();
    const out = service.rerankChunks("q", [
      { chunkId: "1", pageNumberStart: 1, pageNumberEnd: 1, score: 0.1, textSnippet: "" },
      { chunkId: "2", pageNumberStart: 1, pageNumberEnd: 1, score: 0.9, textSnippet: "" }
    ]);
    expect(out[0].chunkId).toBe("2");
  });
});
