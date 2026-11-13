import { z } from "zod";

const scoreSchema = z.object({
  criterionId: z.string().min(1).max(80),
  responseLabel: z.enum(["a", "b"]),
  score: z.number().int().min(1).max(5).nullable(),
  applicable: z.boolean(),
  evidence: z.string().max(3000).optional()
}).refine((value) => !value.applicable || value.score !== null, "Applicable criteria require a score");

const attachmentSchema = z.object({
  fileName: z.string().min(1).max(180),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  dataBase64: z.string().min(1).max(2_100_000)
});

export const evaluationSchema = z.object({
  title: z.string().trim().min(3).max(160),
  prompt: z.string().trim().min(5).max(20_000),
  context: z.string().max(20_000).optional().default(""),
  modelA: z.string().trim().min(1).max(100),
  modelB: z.string().trim().min(1).max(100),
  responseA: z.string().trim().min(1).max(80_000),
  responseB: z.string().trim().min(1).max(80_000),
  preferredResponse: z.enum(["a", "b", "tie"]),
  rationale: z.string().trim().min(40, "Provide a substantive rationale of at least 40 characters").max(20_000),
  suggestedImprovement: z.string().trim().min(10).max(20_000),
  finalNotes: z.string().max(20_000).optional().default(""),
  evidenceA: z.string().trim().min(10).max(20_000),
  evidenceB: z.string().trim().min(10).max(20_000),
  sourceUrl: z.union([z.url(), z.literal("")]).optional().default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  rubricId: z.string().min(1).max(80),
  status: z.enum(["draft", "completed"]),
  isPublished: z.boolean().default(false),
  scores: z.array(scoreSchema).max(100),
  attachments: z.array(attachmentSchema).max(3).optional().default([])
});

export const evaluationPatchSchema = evaluationSchema.partial().refine((value) => Object.keys(value).length > 0, "No changes supplied");

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}
