"use client";

import React from "react";
import { useState } from "react";
import { askQuestion } from "../lib/api";
import { askQuestionStream } from "../lib/sse";
import { useRagStore } from "../state/useRagStore";
import { CitationsList } from "./CitationsList";

export function ChatPanel() {
  const [question, setQuestion] = useState("");
  const documentId = useRagStore((s) => s.selectedDocumentId);
  const status = useRagStore((s) => s.documentStatus);
  const messages = useRagStore((s) => s.messages);
  const citations = useRagStore((s) => s.citations);
  const addMessage = useRagStore((s) => s.addMessage);
  const updateLastAssistantMessage = useRagStore((s) => s.updateLastAssistantMessage);
  const setStreaming = useRagStore((s) => s.setStreaming);
  const setCitations = useRagStore((s) => s.setCitations);

  async function onAskSubmit() {
    if (!documentId || !question.trim()) return;
    addMessage({ role: "user", content: question });
    addMessage({ role: "assistant", content: "" });
    setStreaming(true);
    try {
      await askQuestionStream(
        {
          documentId,
          question
        },
        {
          onToken: (token) => updateLastAssistantMessage(token),
          onCitations: (next) => setCitations(next as never),
          onDone: () => setStreaming(false)
        }
      );
      setQuestion("");
    } catch (error) {
      try {
        const fallback = await askQuestion({
          documentId,
          question
        });
        updateLastAssistantMessage(fallback.answer);
        setCitations(fallback.citations);
        setQuestion("");
      } catch (fallbackError) {
        const message =
          fallbackError instanceof Error ? fallbackError.message : "Failed to get response from backend.";
        updateLastAssistantMessage(`Error: ${message}`);
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <section>
      <h2>Ask about PDF</h2>
      <p>{status === "ready" ? "Ready for questions." : "Upload and wait for indexing."}</p>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question" />
      <button onClick={onAskSubmit} disabled={!documentId || status !== "ready"}>
        Ask
      </button>
      <div>
        {messages.map((m, idx) => (
          <p key={`${m.role}-${idx}`}>
            <strong>{m.role}:</strong> {m.content}
          </p>
        ))}
      </div>
      <CitationsList citations={citations} />
    </section>
  );
}
