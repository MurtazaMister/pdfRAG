"use client";

import { UploadPanel } from "../components/UploadPanel";
import { DocumentStatusBadge } from "../components/DocumentStatusBadge";
import { ChatPanel } from "../components/ChatPanel";
import { useRagStore } from "../state/useRagStore";

export default function HomePage() {
  const uiStage = useRagStore((s) => s.uiStage);
  const errorMessage = useRagStore((s) => s.errorMessage);
  const resetSession = useRagStore((s) => s.resetSession);

  if (uiStage === "chat") {
    return <ChatPanel />;
  }

  if (uiStage === "processing") {
    return <DocumentStatusBadge />;
  }

  if (uiStage === "error") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4">
        <section className="w-full rounded-2xl border border-danger/50 bg-surface p-8 shadow-soft">
          <h1 className="text-2xl font-semibold text-danger">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">{errorMessage ?? "Please retry your upload."}</p>
          <button
            className="mt-6 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white hover:opacity-90"
            type="button"
            onClick={resetSession}
          >
            Start over
          </button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <UploadPanel />
    </main>
  );
}
