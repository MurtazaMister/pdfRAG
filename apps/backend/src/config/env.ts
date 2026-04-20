import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

config();

if (!process.env.OPENAI_API_KEY || !process.env.QDRANT_URL) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);
  const workspaceEnvPath = resolve(currentDir, "../../../../.env");
  config({ path: workspaceEnvPath, override: false });
}

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_EMBED_MODEL: z.string().default("text-embedding-3-large"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4.1-mini"),
  QDRANT_URL: z
    .string()
    .url(),
  QDRANT_API_KEY: z.string().optional(),
  FRONTEND_ORIGIN: z.string().default("*"),
  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(20),
  CHUNK_SIZE_TOKENS: z.coerce.number().int().positive().default(800),
  CHUNK_OVERLAP_TOKENS: z.coerce.number().int().nonnegative().default(120),
  DEFAULT_TOP_K: z.coerce.number().int().positive().default(6),
  ENABLE_RERANK: z
    .string()
    .optional()
    .transform((v) => v === "true")
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadEnv(): AppConfig {
  return EnvSchema.parse(process.env);
}
