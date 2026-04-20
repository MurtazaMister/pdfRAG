import type { IngestionOrchestrator } from "../services/ingestionOrchestrator.js";

type IngestionJob = {
  documentId: string;
  filePath: string;
  filename: string;
};

export class IngestionQueue {
  private readonly jobs: IngestionJob[] = [];
  private running = false;

  constructor(private readonly orchestrator: IngestionOrchestrator) {}

  enqueueIngestionJob(job: IngestionJob) {
    this.jobs.push(job);
    void this.run();
  }

  private async run() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.jobs.length) {
        const job = this.jobs.shift();
        if (!job) continue;
        try {
          await this.orchestrator.runIngestion(job);
        } catch (error) {
          // Keep worker alive if a single document ingestion fails.
          console.error("Ingestion job failed", { documentId: job.documentId, error });
        }
      }
    } finally {
      this.running = false;
    }
  }
}
