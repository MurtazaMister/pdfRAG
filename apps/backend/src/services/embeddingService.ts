import OpenAI from "openai";

export class EmbeddingService {
  constructor(
    private readonly client: OpenAI,
    private readonly model: string
  ) {}

  async embedChunks(chunks: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: chunks
    });
    return response.data.map((d) => d.embedding);
  }

  async embedQuery(question: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: question
    });
    return response.data[0].embedding;
  }
}
