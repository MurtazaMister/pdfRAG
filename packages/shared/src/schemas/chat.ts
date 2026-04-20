import { z } from "zod";

export const AskRequestSchema = z.object({
  documentId: z.string().min(1),
  question: z.string().min(1),
  topK: z.number().int().positive().max(20).optional(),
  rerank: z.boolean().optional(),
  maxContextChunks: z.number().int().positive().max(20).optional()
});

export const CitationSchema = z.object({
  chunkId: z.string(),
  pageNumberStart: z.number().int().positive(),
  pageNumberEnd: z.number().int().positive(),
  score: z.number(),
  textSnippet: z.string()
});

export const AskResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(CitationSchema),
  usage: z.object({
    promptTokens: z.number().int().nonnegative(),
    completionTokens: z.number().int().nonnegative()
  })
});

export type AskRequest = z.infer<typeof AskRequestSchema>;
export type AskResponse = z.infer<typeof AskResponseSchema>;
export type Citation = z.infer<typeof CitationSchema>;
