import { readFile } from "node:fs/promises";
import pdf from "pdf-parse";
import { AppError } from "../lib/errors.js";

export type PdfPage = {
  pageNumber: number;
  text: string;
};

export class PdfParseService {
  async extractPages(filePath: string): Promise<PdfPage[]> {
    try {
      const data = await readFile(filePath);
      const parsed = await pdf(data);
      const lines = parsed.text
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean);
      const text = lines.join("\n");
      return [{ pageNumber: 1, text }];
    } catch (error) {
      throw new AppError("PDF_PARSE_ERROR", `Failed to parse PDF: ${String(error)}`, 422);
    }
  }
}
