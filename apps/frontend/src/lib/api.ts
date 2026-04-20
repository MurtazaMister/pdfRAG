import { AskRequestSchema, type AskResponse, type DocumentStatus } from "@pdf-rag/shared";

type UploadResponse = {
  documentId: string;
  status: "uploaded";
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "network error";
    throw new Error(`Failed to reach API at ${API_BASE} (${reason}).`);
  }

  if (!res.ok) {
    throw new Error(`API request failed (${res.status} ${res.statusText}).`);
  }

  return res.json() as Promise<T>;
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  return fetchJson<UploadResponse>("/v1/documents/upload", {
    method: "POST",
    body: form
  });
}

export async function getDocumentStatus(documentId: string) {
  return fetchJson<{ status: DocumentStatus; errorMessage?: string; filename?: string }>(
    `/v1/documents/${documentId}/status`
  );
}

export async function askQuestion(payload: unknown): Promise<AskResponse> {
  const body = AskRequestSchema.parse(payload);
  return fetchJson<AskResponse>("/v1/chat/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
