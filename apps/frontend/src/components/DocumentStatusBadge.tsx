"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getDocumentStatus } from "../lib/api";
import { useRagStore } from "../state/useRagStore";

export function DocumentStatusBadge() {
  const documentId = useRagStore((s) => s.selectedDocumentId);
  const status = useRagStore((s) => s.documentStatus);
  const setDocumentStatus = useRagStore((s) => s.setDocumentStatus);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const isTerminalStatus = status === "ready" || status === "failed";

  useEffect(() => {
    if (!documentId || isTerminalStatus) {
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
        setStatusError(null);
        setFailureReason(next.status === "failed" ? (next.errorMessage ?? "Unknown parsing error") : null);
        if (next.status === "ready" || next.status === "failed") {
          cancelled = true;
          if (timer) clearInterval(timer);
        }
      } catch {
        if (cancelled) return;
        setStatusError("Unable to reach backend. Check API URL and backend server.");
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
  }, [documentId, isTerminalStatus, setDocumentStatus]);

  return (
    <section>
      <p>
        Document status: {status ?? "none"}
        {statusError ? ` (${statusError})` : ""}
      </p>
      {status === "failed" && failureReason ? (
        <div>
          <p>PDF issue: {failureReason}</p>
          <p>Usually this means the file is damaged, encrypted, or not a real PDF.</p>
          <ul>
            <li>Avoid password-protected or rights-restricted PDFs.</li>
            <li>Avoid files exported by scanners/apps with broken structure.</li>
            <li>Avoid renamed files (e.g., .docx renamed to .pdf).</li>
            <li>Re-save the PDF in a viewer/editor (Print to PDF) and re-upload.</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
