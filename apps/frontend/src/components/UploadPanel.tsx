"use client";

import React from "react";
import { useState } from "react";
import { uploadDocument } from "../lib/api";
import { useRagStore } from "../state/useRagStore";

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const hasFileSelected = Boolean(file);
  const uiStage = useRagStore((s) => s.uiStage);
  const isUploading = uiStage === "uploading";
  const errorMessage = useRagStore((s) => s.errorMessage);
  const setSelectedDocument = useRagStore((s) => s.setSelectedDocument);
  const setDocumentStatus = useRagStore((s) => s.setDocumentStatus);
  const setUiStage = useRagStore((s) => s.setUiStage);
  const setErrorMessage = useRagStore((s) => s.setErrorMessage);
  const resetSession = useRagStore((s) => s.resetSession);

  async function onUploadSubmit() {
    if (!file) {
      setErrorMessage("Please choose a PDF before uploading.");
      return;
    }

    resetSession();
    setUiStage("uploading");
    setErrorMessage(null);
    try {
      const uploaded = await uploadDocument(file);
      setSelectedDocument({ id: uploaded.documentId, name: file.name });
      setDocumentStatus("uploaded");
      setUiStage("processing");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setErrorMessage(message);
      setDocumentStatus("failed");
      setUiStage("error");
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">PDF RAG</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Upload a PDF to start chatting</h1>
        <p className="mt-3 text-sm text-muted">
          Choose one PDF document. We will upload and index it before opening the chat workspace.
        </p>

        <label
          className={[
            "mt-6 block cursor-pointer rounded-xl border border-dashed p-5 text-center transition-all duration-300",
            hasFileSelected
              ? "border-success bg-success/10 ring-2 ring-success/40"
              : "border-border bg-surface-elevated hover:border-accent/60"
          ].join(" ")}
        >
          <span className="block text-sm font-medium text-text">
            {hasFileSelected ? "PDF selected and ready to upload" : "Click to choose a PDF file"}
          </span>
          <span className="mt-1 block text-xs text-muted">Max file size and parsing rules are enforced by backend.</span>
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const nextFile = e.currentTarget.files?.[0] ?? null;
              setFile(nextFile);
              setErrorMessage(null);
            }}
          />
        </label>

        {file ? (
          <div className="mt-4 animate-fade-slide-up rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-text">
            <p className="font-medium">Selected: {file.name}</p>
            <p className="text-xs text-muted">Ready to upload. Press the button below to continue.</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No file selected yet.</p>
        )}
        {errorMessage ? <p className="mt-2 text-sm text-danger">{errorMessage}</p> : null}

        <button
          className={[
            "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition",
            hasFileSelected ? "animate-subtle-pulse bg-accent hover:opacity-90" : "bg-accent",
            "disabled:cursor-not-allowed disabled:opacity-60"
          ].join(" ")}
          onClick={onUploadSubmit}
          disabled={isUploading}
          type="button"
        >
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
    </section>
  );
}
