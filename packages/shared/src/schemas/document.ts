import { z } from "zod";

export const DocumentStatusSchema = z.enum([
  "uploaded",
  "processing",
  "ready",
  "failed"
]);

export const DocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  bytes: z.number().int().nonnegative(),
  mimeType: z.string(),
  uploadedAt: z.string(),
  status: DocumentStatusSchema,
  pageCount: z.number().int().positive().optional(),
  errorMessage: z.string().optional()
});

export const UploadResponseSchema = z.object({
  documentId: z.string(),
  status: z.literal("uploaded")
});

export const DocumentStatusResponseSchema = DocumentSchema;

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type DocumentRecord = z.infer<typeof DocumentSchema>;
