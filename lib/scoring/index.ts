import type { Criterion, Preference, ScoreInput } from "../types";

export interface ScoreResult {
  normalized: number | null;
  earned: number;
  possible: number;
  applicableCount: number;
}

export function calculateNormalizedScore(scores: ScoreInput[], criteria: Criterion[], responseLabel: "a" | "b"): ScoreResult {
  const byId = new Map(criteria.map((criterion) => [criterion.id, criterion]));
  const applicable = scores.filter((item) => item.responseLabel === responseLabel && item.applicable && item.score !== null);
  const earned = applicable.reduce((sum, item) => sum + (item.score ?? 0) * (byId.get(item.criterionId)?.weight ?? 1), 0);
  const possible = applicable.reduce((sum, item) => sum + 5 * (byId.get(item.criterionId)?.weight ?? 1), 0);
  return { normalized: possible === 0 ? null : Math.round((earned / possible) * 1000) / 10, earned, possible, applicableCount: applicable.length };
}

export function preferenceDisagrees(preference: Preference, scoreA: number | null, scoreB: number | null): boolean {
  if (scoreA === null || scoreB === null || scoreA === scoreB) return false;
  return (preference === "a" && scoreB > scoreA) || (preference === "b" && scoreA > scoreB) || preference === "tie";
}
