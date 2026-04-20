"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getDocumentStatus } from "../lib/api";
import { useRagStore } from "../state/useRagStore";

function Step({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3 transition-all duration-300">
      <div
        className={[
          "h-3 w-3 rounded-full border transition-all duration-300",
          done ? "border-success bg-success" : "",
          active ? "border-accent bg-accent" : "",
          !active && !done ? "border-border bg-transparent" : ""
        ].join(" ")}
      />
      <span className={active || done ? "text-text" : "text-muted"}>{label}</span>
    </div>
  );
}

export function DocumentStatusBadge() {
  const documentId = useRagStore((s) => s.selectedDocumentId);
  const status = useRagStore((s) => s.documentStatus);
  const setSelectedDocumentName = useRagStore((s) => s.setSelectedDocumentName);
  const setDocumentStatus = useRagStore((s) => s.setDocumentStatus);
  const setUiStage = useRagStore((s) => s.setUiStage);
  const setErrorMessage = useRagStore((s) => s.setErrorMessage);
  const errorMessage = useRagStore((s) => s.errorMessage);
  const [statusError, setStatusError] = useState<string | null>(errorMessage);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const resetSession = useRagStore((s) => s.resetSession);

  useEffect(() => {
    if (!documentId || status === "ready" || status === "failed") {
      setStatusError(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    const poll = async () => {
      if (cancelled) return;
      try {
        const next = await getDocumentStatus(documentId);
        if (cancelled) return;
        setDocumentStatus(next.status);
        if (next.filename) setSelectedDocumentName(next.filename);
        setStatusError(null);
        setErrorMessage(null);
        setFailureReason(next.status === "failed" ? (next.errorMessage ?? "Unknown parsing error") : null);
        if (next.status === "ready") {
          setUiStage("chat");
        }
        if (next.status === "failed") {
          setUiStage("error");
          setErrorMessage(next.errorMessage ?? "Failed to process document.");
        }
        if (next.status === "ready" || next.status === "failed") {
          cancelled = true;
          if (timer) clearInterval(timer);
        }
      } catch {
        if (cancelled) return;
        const message = "Unable to reach backend. Check API URL and backend server.";
        setStatusError(message);
        setErrorMessage(message);
      }
    };

    const startPolling = async () => {
      await poll();
      if (cancelled) return;
      timer = setInterval(() => {
        void poll();
      }, 2000);
    };

    void startPolling();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [documentId, setDocumentStatus, setErrorMessage, setSelectedDocumentName, setUiStage, status]);

  const isUploading = status === "uploaded";
  const isProcessing = status === "processing";
  const isReady = status === "ready";

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
      <div className="w-full animate-fade-slide-up rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="text-2xl font-semibold transition-colors duration-300">Preparing your document</h2>
        <p className="mt-2 text-sm text-muted">Upload is complete. We are indexing the PDF for question answering.</p>

        <div className="mt-6 grid gap-4">
          <Step label="Uploading" active={isUploading} done={Boolean(documentId)} />
          <Step label="Processing" active={isProcessing} done={isReady} />
          <Step label="Ready for Chat" active={isReady} done={isReady} />
        </div>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div className="animate-loading-bar h-full w-1/2 rounded-full bg-accent" />
        </div>
        <p className="mt-3 text-sm text-muted">Status: {status ?? "waiting"}</p>

        {statusError ? <p className="mt-2 text-sm text-danger">{statusError}</p> : null}
      {status === "failed" && failureReason ? (
        <div className="mt-5 rounded-lg border border-danger/50 bg-danger/10 p-4">
          <p className="font-medium text-danger">PDF issue: {failureReason}</p>
          <p className="mt-2 text-sm text-muted">Usually this means the file is damaged, encrypted, or not a real PDF.</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
            <li>Avoid password-protected or rights-restricted PDFs</li>
            <li>Avoid files exported by scanners/apps with broken structure</li>
            <li>Avoid renamed files such as .docx changed to .pdf</li>
            <li>Re-save with Print to PDF and upload again</li>
          </ul>
          <button
            className="mt-4 rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-elevated"
            type="button"
            onClick={resetSession}
          >
            Upload another file
          </button>
        </div>
      ) : null}
      </div>
    </section>
  );
}
