import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { DocumentRecord, DocumentStatus } from "@pdf-rag/shared";

type DocumentIndex = Record<string, DocumentRecord>;

export class DocumentRepository {
  private readonly indexPath = resolve("apps/backend/storage/documents/index.json");

  private async readIndex(): Promise<DocumentIndex> {
    try {
      const raw = await readFile(this.indexPath, "utf8");
      return JSON.parse(raw) as DocumentIndex;
    } catch {
      return {};
    }
  }

  private async writeIndex(index: DocumentIndex): Promise<void> {
    await mkdir(dirname(this.indexPath), { recursive: true });
    await writeFile(this.indexPath, JSON.stringify(index, null, 2), "utf8");
  }

  async createDocumentRecord(input: Omit<DocumentRecord, "uploadedAt">) {
    const index = await this.readIndex();
    const record: DocumentRecord = {
      ...input,
      uploadedAt: new Date().toISOString()
    };
    index[record.id] = record;
    await this.writeIndex(index);
    return record;
  }

  async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    patch: Partial<DocumentRecord> = {}
  ) {
    const index = await this.readIndex();
    const current = index[documentId];
    if (!current) return null;
    const next: DocumentRecord = { ...current, ...patch, status };
    index[documentId] = next;
    await this.writeIndex(index);
    return next;
  }

  async getDocumentById(documentId: string) {
    const index = await this.readIndex();
    return index[documentId] ?? null;
  }
}
