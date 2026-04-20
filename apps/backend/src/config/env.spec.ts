import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

describe("loadEnv", () => {
  it("throws for invalid env", () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(() => loadEnv()).toThrow();
    process.env.OPENAI_API_KEY = prev;
  });
});
