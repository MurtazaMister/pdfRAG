import OpenAI from "openai";
import type { RetrievedChunk } from "./retrievalService.js";
import { buildAnswerPrompt } from "./promptService.js";

export class AnswerService {
  constructor(
    private readonly client: OpenAI,
    private readonly model: string
  ) {}

  async generateAnswerNonStream(input: {
    question: string;
    chunks: RetrievedChunk[];
  }) {
    const prompt = buildAnswerPrompt(input);
    const completion = await this.client.responses.create({
      model: this.model,
      input: prompt,
      temperature: 0.1
    });

    return {
      answer: completion.output_text,
      usage: {
        promptTokens: completion.usage?.input_tokens ?? 0,
        completionTokens: completion.usage?.output_tokens ?? 0
      }
    };
  }

  async *generateAnswerStream(input: { question: string; chunks: RetrievedChunk[] }) {
    const prompt = buildAnswerPrompt(input);
    const stream = await this.client.responses.stream({
      model: this.model,
      input: prompt,
      temperature: 0.1
    });
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        yield { token: event.delta };
      }
    }
    const final = await stream.finalResponse();
    yield {
      done: true,
      usage: {
        promptTokens: final.usage?.input_tokens ?? 0,
        completionTokens: final.usage?.output_tokens ?? 0
      }
    };
  }
}
