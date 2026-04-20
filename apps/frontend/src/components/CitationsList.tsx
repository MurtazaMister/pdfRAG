"use client";

import React from "react";
import type { Citation } from "@pdf-rag/shared";

/**
 * Vector scores from Qdrant (cosine) are not calibrated like "80% sure" for end users.
 * We rank sources within this answer so labels stay meaningful.
 */
function getRankLabel(sortedIndex: number, total: number) {
  if (total <= 1) return "Referenced in this answer";
  if (sortedIndex === 0) return "Strongest match for your question";
  if (sortedIndex === total - 1) return "Additional context";
  return "Supporting source";
}

export function CitationsList({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;

  const ordered = [...citations].sort((a, b) => b.score - a.score);

  return (
    <section className="animate-fade-in rounded-xl border border-border bg-background p-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Sources</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        Order reflects how closely each passage matched your question in this retrieval step (not a calibrated
        percentage).
      </p>
      <ul className="mt-2 space-y-2">
        {ordered.map((c, sortedIndex) => (
          <li
            key={`${c.chunkId}-${sortedIndex}`}
            className="rounded-lg border border-border/60 bg-surface p-2 text-xs text-muted transition hover:border-accent/50"
          >
            <p>
              Page {c.pageNumberStart}
              {c.pageNumberEnd !== c.pageNumberStart ? `-${c.pageNumberEnd}` : ""}
            </p>
            <p>{getRankLabel(sortedIndex, ordered.length)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
