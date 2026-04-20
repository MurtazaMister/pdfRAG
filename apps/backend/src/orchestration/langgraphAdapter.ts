type IngestionInput = {
  documentId: string;
  filePath: string;
  filename: string;
};

export class LanggraphAdapter {
  async runIngestion(_input: IngestionInput) {
    throw new Error("LangGraph adapter is optional and not enabled in this starter.");
  }
}
