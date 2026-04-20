import { z } from "zod";

export const ChunkSchema = z.object({
  chunkId: z.string(),
  documentId: z.string(),
  pageNumberStart: z.number().int().positive(),
  pageNumberEnd: z.number().int().positive(),
  content: z.string(),
  tokenCount: z.number().int().nonnegative(),
  ordinal: z.number().int().nonnegative()
});

export type Chunk = z.infer<typeof ChunkSchema>;
