import { z } from "zod";

export const ApiErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "DOCUMENT_NOT_FOUND",
  "DOCUMENT_NOT_READY",
  "PDF_PARSE_ERROR",
  "EMBEDDING_ERROR",
  "INTERNAL_ERROR"
]);

export const ApiErrorSchema = z.object({
  code: ApiErrorCodeSchema,
  message: z.string()
});

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;
