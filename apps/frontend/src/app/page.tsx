import { UploadPanel } from "../components/UploadPanel";
import { DocumentStatusBadge } from "../components/DocumentStatusBadge";
import { ChatPanel } from "../components/ChatPanel";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>PDF RAG Starter</h1>
      <UploadPanel />
      <DocumentStatusBadge />
      <ChatPanel />
    </main>
  );
}
