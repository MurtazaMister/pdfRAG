export type DocumentUploadedEvent = {
  documentId: string;
  filename: string;
  at: string;
};

export type IngestionCompletedEvent = {
  documentId: string;
  chunkCount: number;
  at: string;
};

export type AnswerGeneratedEvent = {
  documentId: string;
  question: string;
  citationCount: number;
  at: string;
};
