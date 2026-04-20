"use client";

import React from "react";
import type { Citation } from "@pdf-rag/shared";

export function CitationsList({ citations }: { citations: Citation[] }) {
  return (
    <section>
      <h3>Citations</h3>
      <ul>
        {citations.map((c) => (
          <li key={c.chunkId}>
            {c.chunkId} (p.{c.pageNumberStart}-{c.pageNumberEnd}) score {c.score.toFixed(3)}
          </li>
        ))}
      </ul>
    </section>
  );
}
