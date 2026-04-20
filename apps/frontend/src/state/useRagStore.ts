"use client";

import { create } from "zustand";
import type { Citation, DocumentStatus } from "@pdf-rag/shared";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  citations?: Citation[];
};

export type UiStage = "idle" | "uploading" | "processing" | "chat" | "error";
export type ChatPhase = "idle" | "awaiting" | "streaming";

type RagState = {
  selectedDocumentId: string | null;
  selectedDocumentName: string | null;
  documentStatus: DocumentStatus | null;
  uiStage: UiStage;
  chatPhase: ChatPhase;
  errorMessage: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  citations: Citation[];
  setSelectedDocument: (payload: { id: string; name: string }) => void;
  setSelectedDocumentName: (name: string) => void;
  setDocumentStatus: (status: DocumentStatus) => void;
  setUiStage: (stage: UiStage) => void;
  setChatPhase: (phase: ChatPhase) => void;
  setErrorMessage: (message: string | null) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  updateLastAssistantMessage: (delta: string) => void;
  setStreaming: (streaming: boolean) => void;
  setCitations: (citations: Citation[]) => void;
  attachCitationsToLastAssistantMessage: (citations: Citation[]) => void;
  resetSession: () => void;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useRagStore = create<RagState>((set) => ({
  selectedDocumentId: null,
  selectedDocumentName: null,
  documentStatus: null,
  uiStage: "idle",
  chatPhase: "idle",
  errorMessage: null,
  messages: [],
  isStreaming: false,
  citations: [],
  setSelectedDocument: ({ id, name }) =>
    set({
      selectedDocumentId: id,
      selectedDocumentName: name
    }),
  setSelectedDocumentName: (name) => set({ selectedDocumentName: name }),
  setDocumentStatus: (status) => set({ documentStatus: status }),
  setUiStage: (stage) => set({ uiStage: stage }),
  setChatPhase: (phase) => set({ chatPhase: phase }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: createMessageId(), createdAt: new Date().toISOString() }]
    })),
  updateLastAssistantMessage: (delta) =>
    set((state) => {
      const messages = [...state.messages];
      if (!messages.length || messages[messages.length - 1].role !== "assistant") {
        messages.push({
          id: createMessageId(),
          role: "assistant",
          content: delta,
          createdAt: new Date().toISOString()
        });
      } else {
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, content: last.content + delta };
      }
      return { messages };
    }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setCitations: (citations) => set({ citations }),
  attachCitationsToLastAssistantMessage: (citations) =>
    set((state) => {
      const messages = [...state.messages];
      for (let index = messages.length - 1; index >= 0; index -= 1) {
        if (messages[index].role === "assistant") {
          messages[index] = { ...messages[index], citations };
          break;
        }
      }
      return { messages };
    }),
  resetSession: () =>
    set({
      selectedDocumentId: null,
      selectedDocumentName: null,
      documentStatus: null,
      uiStage: "idle",
      chatPhase: "idle",
      errorMessage: null,
      messages: [],
      isStreaming: false,
      citations: []
    })
}));
