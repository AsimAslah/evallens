import { describe, expect, it } from "vitest";
import { calculateNormalizedScore } from "../lib/scoring";
import { rubricInputSchema, validateScoresAgainstCriteria } from "../lib/validation/rubric";
import type { Criterion, ScoreInput } from "../lib/types";

const criteria: Criterion[] = [
  { id: "accuracy", name: "Accuracy", description: "Correct claims", weight: 3, sortOrder: 1 },
  { id: "style", name: "Style", description: "Clear writing", weight: 1, sortOrder: 2 }
];
const scores: ScoreInput[] = [
  { criterionId: "accuracy", responseLabel: "a", score: 5, applicable: true },
  { criterionId: "style", responseLabel: "a", score: 1, applicable: true },
  { criterionId: "accuracy", responseLabel: "b", score: 3, applicable: true },
  { criterionId: "style", responseLabel: "b", score: null, applicable: false }
];

describe("custom rubrics", () => {
  it("uses custom criterion weights and independent applicability", () => {
    expect(calculateNormalizedScore(scores, criteria, "a").normalized).toBe(80);
    expect(calculateNormalizedScore(scores, criteria, "b").normalized).toBe(60);
  });
  it("returns N/A when every criterion is not applicable", () => {
    const allNA = scores.map((score) => ({ ...score, score: null, applicable: false }));
    expect(calculateNormalizedScore(allNA, criteria, "a").normalized).toBeNull();
  });
  it("requires exactly one A and B score per selected criterion", () => {
    expect(validateScoresAgainstCriteria(scores, criteria)).toBeNull();
    expect(validateScoresAgainstCriteria([...scores, scores[0]], criteria)).toMatch(/Duplicate/);
    expect(validateScoresAgainstCriteria(scores.slice(1), criteria)).toMatch(/Missing A score/);
    expect(validateScoresAgainstCriteria([...scores.slice(0, -1), { ...scores[3], criterionId: "unknown" }], criteria)).toMatch(/Unknown/);
  });
  it("validates names, weights, limits, and duplicates", () => {
    expect(rubricInputSchema.safeParse({ name: "Custom rubric", description: "A sufficiently detailed rubric.", criteria }).success).toBe(true);
    expect(rubricInputSchema.safeParse({ name: "Custom rubric", description: "A sufficiently detailed rubric.", criteria: [{ ...criteria[0], weight: 0 }] }).success).toBe(false);
    expect(rubricInputSchema.safeParse({ name: "Custom rubric", description: "A sufficiently detailed rubric.", criteria: [criteria[0], { ...criteria[1], name: "accuracy" }] }).success).toBe(false);
  });
});
