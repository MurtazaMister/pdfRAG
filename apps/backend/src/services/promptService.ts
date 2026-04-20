import type { RetrievedChunk } from "./retrievalService.js";

export function buildAnswerPrompt(input: {
  question: string;
  chunks: RetrievedChunk[];
}) {
  const context = input.chunks
    .map(
      (chunk, idx) =>
        `[chunk:${chunk.chunkId}|rank:${idx + 1}|pages:${chunk.pageNumberStart}-${chunk.pageNumberEnd}]\n${chunk.textSnippet}`
    )
    .join("\n\n");

  return `You are a PDF QA assistant. Answer only from the provided context.\nIf context is insufficient, explicitly say so.\nAlways include supporting chunk IDs in the answer.\n\nQuestion:\n${input.question}\n\nContext:\n${context}`;
}
