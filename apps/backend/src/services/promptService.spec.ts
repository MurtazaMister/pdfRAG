import { describe, expect, it } from "vitest";
import { buildAnswerPrompt } from "./promptService.js";

describe("buildAnswerPrompt", () => {
  it("includes chunk citation markers", () => {
    const prompt = buildAnswerPrompt({
      question: "What is this?",
      chunks: [
        {
          chunkId: "c1",
          pageNumberStart: 1,
          pageNumberEnd: 1,
          score: 0.9,
          textSnippet: "hello"
        }
      ]
    });
    expect(prompt).toContain("[chunk:c1");
  });
});
