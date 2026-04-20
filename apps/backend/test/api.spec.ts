import { describe, expect, it } from "vitest";
import { buildServer } from "../src/server.js";

const config = {
  OPENAI_API_KEY: "test-key",
  OPENAI_EMBED_MODEL: "text-embedding-3-large",
  OPENAI_CHAT_MODEL: "gpt-4.1-mini",
  QDRANT_URL: "http://localhost:6333",
  QDRANT_API_KEY: "",
  FRONTEND_ORIGIN: "*",
  BACKEND_PORT: 4000,
  MAX_UPLOAD_MB: 20,
  CHUNK_SIZE_TOKENS: 800,
  CHUNK_OVERLAP_TOKENS: 120,
  DEFAULT_TOP_K: 6,
  ENABLE_RERANK: false
};

describe("backend API", () => {
  it("returns health", async () => {
    const app = buildServer(config);
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
    await app.close();
  });
});
