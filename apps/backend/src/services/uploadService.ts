import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { MultipartFile } from "@fastify/multipart";
import { AppError } from "../lib/errors.js";

export class UploadService {
  constructor(private readonly maxUploadMb: number) {}

  validateUpload(file: MultipartFile) {
    if (file.mimetype !== "application/pdf") {
      throw new AppError("VALIDATION_ERROR", "Only PDF files are accepted.", 400);
    }
  }

  async savePdfToStorage(file: MultipartFile) {
    this.validateUpload(file);
    const documentId = randomUUID();
    const dir = resolve("apps/backend/storage/documents", documentId);
    await mkdir(dir, { recursive: true });
    const filePath = resolve(dir, "source.pdf");
    const writer = createWriteStream(filePath);

    let bytes = 0;
    for await (const chunk of file.file) {
      bytes += chunk.length;
      if (bytes > this.maxUploadMb * 1024 * 1024) {
        throw new AppError("VALIDATION_ERROR", "PDF exceeds max upload size.", 400);
      }
      writer.write(chunk);
    }
    writer.end();
    return {
      documentId,
      filePath,
      bytes,
      mimeType: file.mimetype,
      filename: file.filename
    };
  }
}
