import { z } from "zod";
import type { Criterion, ScoreInput } from "../types";

export const rubricInputSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  criteria: z.array(z.object({
    id: z.string().max(80).optional().default(""),
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(5).max(500),
    weight: z.number().positive().max(20),
    sortOrder: z.number().int().min(0).max(100).optional().default(0)
  })).min(1).max(20)
}).superRefine((value, context) => {
  const names = value.criteria.map((criterion) => criterion.name.toLocaleLowerCase());
  if (new Set(names).size !== names.length) context.addIssue({ code: "custom", path: ["criteria"], message: "Criterion names must be unique within a rubric" });
});

export function validateScoresAgainstCriteria(scores: ScoreInput[], criteria: Criterion[]): string | null {
  const expected = new Set(criteria.map((criterion) => criterion.id));
  if (expected.size !== criteria.length) return "Rubric contains duplicate criterion identifiers";
  const seen = new Set<string>();
  for (const score of scores) {
    if (!expected.has(score.criterionId)) return `Unknown criterion identifier: ${score.criterionId}`;
    const key = `${score.responseLabel}:${score.criterionId}`;
    if (seen.has(key)) return `Duplicate score entry: ${key}`;
    seen.add(key);
  }
  for (const criterion of criteria) {
    for (const label of ["a", "b"] as const) if (!seen.has(`${label}:${criterion.id}`)) return `Missing ${label.toUpperCase()} score for ${criterion.name}`;
  }
  return scores.length === criteria.length * 2 ? null : "Score set does not match the selected rubric";
}
