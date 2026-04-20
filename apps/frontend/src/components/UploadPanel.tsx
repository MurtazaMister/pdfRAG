"use client";

import React from "react";
import { useState } from "react";
import { uploadDocument } from "../lib/api";
import { useRagStore } from "../state/useRagStore";

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const setSelectedDocumentId = useRagStore((s) => s.setSelectedDocumentId);
  const setDocumentStatus = useRagStore((s) => s.setDocumentStatus);

  async function onUploadSubmit() {
    if (!file) {
      setUploadError("Please choose a PDF before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setDocumentStatus("uploading");
    try {
      const uploaded = await uploadDocument(file);
      setSelectedDocumentId(uploaded.documentId);
      setDocumentStatus("uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setUploadError(message);
      setDocumentStatus("failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section>
      <h2>Upload PDF</h2>
      <input
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => {
          const nextFile = e.currentTarget.files?.[0] ?? null;
          setFile(nextFile);
          setUploadError(null);
        }}
      />
      {file ? <p>Selected file: {file.name}</p> : <p>No file selected.</p>}
      {uploadError ? <p>Upload error: {uploadError}</p> : null}
      <button onClick={onUploadSubmit} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </section>
  );
}
