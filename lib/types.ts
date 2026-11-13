export type Preference = "a" | "b" | "tie";
export type EvaluationStatus = "draft" | "completed";
export type ResponseLabel = "a" | "b";

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  sortOrder: number;
}

export interface ScoreInput {
  criterionId: string;
  responseLabel: ResponseLabel;
  score: number | null;
  applicable: boolean;
  evidence?: string;
}

export interface AttachmentInput {
  fileName: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  dataBase64: string;
}

export interface EvaluationInput {
  title: string;
  prompt: string;
  context?: string;
  modelA: string;
  modelB: string;
  responseA: string;
  responseB: string;
  preferredResponse: Preference;
  rationale: string;
  suggestedImprovement: string;
  finalNotes?: string;
  evidenceA: string;
  evidenceB: string;
  sourceUrl?: string;
  tags: string[];
  rubricId: string;
  status: EvaluationStatus;
  isPublished: boolean;
  scores: ScoreInput[];
  attachments?: AttachmentInput[];
}

export interface EvaluationRecord extends EvaluationInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  normalizedScoreA: number | null;
  normalizedScoreB: number | null;
}
