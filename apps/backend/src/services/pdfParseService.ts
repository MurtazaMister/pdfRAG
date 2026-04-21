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
      const pages: PdfPage[] = [];
      await pdf(data, {
        pagerender: async (pageData: { pageIndex?: number; getTextContent: () => Promise<any> }) => {
          const textContent = await pageData.getTextContent();
          const text = (textContent.items as Array<{ str?: string }>)
            .map((item) => item.str?.trim() ?? "")
            .filter(Boolean)
            .join(" ");
          pages.push({
            pageNumber: (pageData.pageIndex ?? pages.length) + 1,
            text
          });
          return text;
        }
      });
      return pages.filter((page) => page.text.length > 0);
    } catch (error) {
      throw new AppError("PDF_PARSE_ERROR", `Failed to parse PDF: ${String(error)}`, 422);
    }
  }
}
