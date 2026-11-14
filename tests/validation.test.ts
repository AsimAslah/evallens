import { describe, expect, it } from "vitest";
import { DEMO_EVALUATION } from "@/lib/constants";
import { evaluationSchema } from "@/lib/validation/evaluation";

describe("evaluation validation", () => {
  it("accepts the verified demonstration", () => {
    expect(evaluationSchema.safeParse(DEMO_EVALUATION).success).toBe(true);
  });

  it("requires substantive evidence and rationale", () => {
    const parsed = evaluationSchema.safeParse({ ...DEMO_EVALUATION, rationale: "Too short", evidenceA: "vague" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.map((issue) => issue.path.join("."))).toEqual(expect.arrayContaining(["rationale", "evidenceA"]));
  });

  it("rejects missing and out-of-range applicable scores", () => {
    const missing = DEMO_EVALUATION.scores.map((item, index) => index === 0 ? { ...item, score: null, applicable: true } : item);
    const outOfRange = DEMO_EVALUATION.scores.map((item, index) => index === 0 ? { ...item, score: 6 } : item);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, scores: missing }).success).toBe(false);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, scores: outOfRange }).success).toBe(false);
  });

  it("rejects malformed source URLs and overlong responses", () => {
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, sourceUrl: "not a url" }).success).toBe(false);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, sourceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, responseA: "x".repeat(80_001) }).success).toBe(false);
  });

  it("accepts evidence-based error-category tags and enforces tag limits", () => {
    const tags = ["hallucination", "constraint-violation", "missing-information", "unsupported-claim"];
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, tags }).success).toBe(true);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, tags: Array.from({ length: 13 }, (_, index) => `tag-${index}`) }).success).toBe(false);
  });

  it("rejects unsupported or oversized attachments", () => {
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, attachments: [{ fileName: "evidence.svg", mimeType: "image/svg+xml", dataBase64: "abc" }] }).success).toBe(false);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, attachments: [{ fileName: "evidence.png", mimeType: "image/png", dataBase64: `data:image/png;base64,${"a".repeat(350_000)}` }] }).success).toBe(false);
    expect(evaluationSchema.safeParse({ ...DEMO_EVALUATION, attachments: [{ fileName: "evidence.png", mimeType: "image/png", dataBase64: "data:image/jpeg;base64,YWJj" }] }).success).toBe(false);
  });
});
