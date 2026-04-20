import { AskRequestSchema } from "@pdf-rag/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export async function askQuestionStream(
  payload: unknown,
  handlers: {
    onToken: (token: string) => void;
    onCitations: (citations: unknown[]) => void;
    onDone: () => void;
  }
) {
  const body = AskRequestSchema.parse(payload);
  const response = await fetch(`${API_BASE}/v1/chat/ask/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    let message = `API request failed (${response.status} ${response.statusText}).`;
    try {
      const errorBody = (await response.json()) as { message?: string; error?: { message?: string } };
      message = errorBody.message ?? errorBody.error?.message ?? message;
    } catch {
      // Keep the fallback message if the error body isn't JSON.
    }
    throw new Error(message);
  }
  if (!response.body) throw new Error("No stream body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const eventBlock of events) {
      const eventLine = eventBlock.split("\n").find((line) => line.startsWith("event: "));
      const dataLine = eventBlock.split("\n").find((line) => line.startsWith("data: "));
      if (!eventLine || !dataLine) continue;
      const event = eventLine.replace("event: ", "").trim();
      const data = JSON.parse(dataLine.replace("data: ", ""));
      if (event === "token") handlers.onToken(data.token);
      if (event === "citations") handlers.onCitations(data.citations);
      if (event === "done") handlers.onDone();
    }
  }
}
