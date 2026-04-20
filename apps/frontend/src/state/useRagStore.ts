"use client";

import { create } from "zustand";
import type { Citation } from "@pdf-rag/shared";

type Message = { role: "user" | "assistant"; content: string };

type RagState = {
  selectedDocumentId: string | null;
  documentStatus: string | null;
  messages: Message[];
  isStreaming: boolean;
  citations: Citation[];
  setSelectedDocumentId: (id: string) => void;
  setDocumentStatus: (status: string) => void;
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (delta: string) => void;
  setStreaming: (streaming: boolean) => void;
  setCitations: (citations: Citation[]) => void;
};

export const useRagStore = create<RagState>((set) => ({
  selectedDocumentId: null,
  documentStatus: null,
  messages: [],
  isStreaming: false,
  citations: [],
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
  setDocumentStatus: (status) => set({ documentStatus: status }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastAssistantMessage: (delta) =>
    set((state) => {
      const messages = [...state.messages];
      if (!messages.length || messages[messages.length - 1].role !== "assistant") {
        messages.push({ role: "assistant", content: delta });
      } else {
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, content: last.content + delta };
      }
      return { messages };
    }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setCitations: (citations) => set({ citations })
}));
