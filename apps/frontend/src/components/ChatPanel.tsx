"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../lib/api";
import { askQuestionStream } from "../lib/sse";
import { useRagStore } from "../state/useRagStore";
import { CitationsList } from "./CitationsList";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripChunkIds(content: string, chunkIds: string[] = []) {
  if (!chunkIds.length) return content;
  let cleaned = content;
  for (const id of chunkIds) {
    const pattern = new RegExp(escapeRegex(id), "gi");
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Remove model-added footnotes like "(Supporting chunk ID: …)" or "(chunk ID: …)". */
function stripChunkIdFootnotes(content: string) {
  let cleaned = content;
  const patterns = [
    /\s*\(?\s*Supporting\s+chunk\s+ID\s*:\s*[^)\n]*\)?\.?/gi,
    /\s*\(?\s*chunk\s+ID\s*:\s*[^)\n]*\)?\.?/gi,
    /\s*\(?\s*Chunk\s+ID\s*:\s*[^)\n]*\)?\.?/gi,
    /\s*\[\s*Supporting\s+chunk\s+ID\s*:\s*[^\]\n]*\]?\.?/gi,
    /\s*\[\s*chunk\s+ID\s*:\s*[^\]\n]*\]?\.?/gi,
    /\s*Supporting\s+chunk\s+ID\s*:\s*\S*/gi,
    /\s*chunk\s+ID\s*:\s*\S*/gi
  ];
  for (const re of patterns) {
    cleaned = cleaned.replace(re, "");
  }
  return cleaned.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function formatMessageContent(content: string, chunkIds: string[] = []) {
  const withoutChunkIds = stripChunkIdFootnotes(stripChunkIds(content, chunkIds));
  return withoutChunkIds
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getMessageAnimationClass(index: number) {
  return index % 2 === 0 ? "animate-fade-slide-up" : "animate-fade-in";
}

function getCitationChunkIds(citations?: { chunkId: string }[]) {
  if (!citations) return [];
  return citations.map((c) => c.chunkId);
}

function getThinkingLabel(chatPhase: "idle" | "awaiting" | "streaming") {
  if (chatPhase === "awaiting") return "Thinking...";
  if (chatPhase === "streaming") return "Generating response...";
  return "";
}

function isChatBusy(chatPhase: "idle" | "awaiting" | "streaming") {
  return chatPhase !== "idle";
}

function getInputPlaceholder(ready: boolean) {
  return ready ? "Ask about this PDF..." : "Waiting for document processing...";
}

function getHeaderDocumentName(name: string | null) {
  return name ?? "Untitled document";
}

function getEmptyStateMessage() {
  return "Ask a question to begin chatting with your PDF.";
}

export function ChatPanel() {
  const [question, setQuestion] = useState("");
  const documentId = useRagStore((s) => s.selectedDocumentId);
  const documentName = useRagStore((s) => s.selectedDocumentName);
  const status = useRagStore((s) => s.documentStatus);
  const chatPhase = useRagStore((s) => s.chatPhase);
  const messages = useRagStore((s) => s.messages);
  const addMessage = useRagStore((s) => s.addMessage);
  const updateLastAssistantMessage = useRagStore((s) => s.updateLastAssistantMessage);
  const setStreaming = useRagStore((s) => s.setStreaming);
  const setChatPhase = useRagStore((s) => s.setChatPhase);
  const setCitations = useRagStore((s) => s.setCitations);
  const attachCitationsToLastAssistantMessage = useRagStore((s) => s.attachCitationsToLastAssistantMessage);
  const setErrorMessage = useRagStore((s) => s.setErrorMessage);
  const resetSession = useRagStore((s) => s.resetSession);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messagesEndRef.current;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatPhase]);

  async function onAskSubmit() {
    if (!documentId || !question.trim() || status !== "ready") return;
    const trimmedQuestion = question.trim();
    addMessage({ role: "user", content: trimmedQuestion });
    addMessage({ role: "assistant", content: "" });
    setStreaming(true);
    setChatPhase("awaiting");
    setErrorMessage(null);
    setCitations([]);
    try {
      await askQuestionStream(
        {
          documentId,
          question: trimmedQuestion
        },
        {
          onToken: (token) => {
            setChatPhase("streaming");
            updateLastAssistantMessage(token);
          },
          onCitations: (next) => {
            setCitations(next);
            attachCitationsToLastAssistantMessage(next);
          },
          onDone: () => {
            setStreaming(false);
            setChatPhase("idle");
          }
        }
      );
      setQuestion("");
    } catch (error) {
      try {
        const fallback = await askQuestion({
          documentId,
          question: trimmedQuestion
        });
        updateLastAssistantMessage(fallback.answer);
        setCitations(fallback.citations);
        attachCitationsToLastAssistantMessage(fallback.citations);
        setChatPhase("idle");
        setQuestion("");
      } catch (fallbackError) {
        const message =
          fallbackError instanceof Error ? fallbackError.message : "Failed to get response from backend.";
        updateLastAssistantMessage(`Error: ${message}`);
        setErrorMessage(message);
        setChatPhase("idle");
      }
    } finally {
      setStreaming(false);
      setChatPhase("idle");
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Current PDF</p>
          <p className="text-sm font-medium text-text">{getHeaderDocumentName(documentName)}</p>
        </div>
        <button
          type="button"
          onClick={resetSession}
          className="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-elevated"
        >
          New upload
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-surface p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">{getEmptyStateMessage()}</p>
        ) : null}
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={[
              m.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]",
              getMessageAnimationClass(index)
            ].join(" ")}
          >
            <div
              className={[
                "rounded-2xl px-4 py-3 text-sm leading-7",
                m.role === "user" ? "bg-accent text-white" : "bg-surface-elevated text-text"
              ].join(" ")}
            >
              {formatMessageContent(m.content, getCitationChunkIds(m.citations)).map((paragraph, idx) => (
                <p className={idx > 0 ? "mt-3" : ""} key={`${m.id}-paragraph-${idx}`}>
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="mt-1 px-1 text-[11px] text-muted">{formatMessageTime(m.createdAt)}</p>
            {m.role === "assistant" && m.citations && m.citations.length ? (
              <div className="mt-2">
                <CitationsList citations={m.citations} />
              </div>
            ) : null}
          </div>
        ))}
        {chatPhase === "awaiting" || chatPhase === "streaming" ? (
          <div
            className="mr-auto flex max-w-[85%] animate-fade-in items-center gap-2 rounded-2xl bg-surface-elevated px-4 py-3 text-sm text-muted outline-none ring-0"
            tabIndex={-1}
            aria-live="polite"
          >
            <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-muted border-t-accent" />
            <span className="select-none">{getThinkingLabel(chatPhase)}</span>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="sticky bottom-0 mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
        onSubmit={(e) => {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur();
          void onAskSubmit();
        }}
      >
        <label htmlFor="chat-question" className="sr-only">
          Ask a question
        </label>
        <input
          id="chat-question"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text outline-none ring-accent placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={getInputPlaceholder(status === "ready")}
          disabled={!documentId || status !== "ready" || isChatBusy(chatPhase)}
          aria-label="Ask a question about the uploaded PDF"
        />
        <button
          className="rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white outline-none transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!documentId || status !== "ready" || !question.trim() || isChatBusy(chatPhase)}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );
}
