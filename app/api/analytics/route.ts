import { isOwnerRequest } from "@/lib/auth";
import { listEvaluations } from "@/lib/db/repository";

export async function GET(request: Request) {
  const records = await listEvaluations({ publicOnly: !isOwnerRequest(request, env.ADMIN_API_TOKEN) });
  const completed = records.filter((record) => record.status === "completed");
  const preference = { a: 0, b: 0, tie: 0 };
  completed.forEach((record) => { preference[record.preferredResponse] += 1; });
  const byDate = new Map<string, number>();
  completed.forEach((record) => { const date = record.createdAt.slice(0, 10); byDate.set(date, (byDate.get(date) ?? 0) + 1); });
  const criterionMap = new Map<string, number[]>();
  completed.forEach((record) => record.rubricCriteria.forEach((item) => {
    const values = record.scores.filter((score) => score.criterionId === item.id && score.applicable && score.score !== null).map((score) => score.score as number);
    criterionMap.set(item.name, [...(criterionMap.get(item.name) ?? []), ...values]);
  }));
  const criterion = Array.from(criterionMap, ([name, values]) => ({ name, average: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : null, sampleSize: values.length }));
  const modelMap = new Map<string, { total: number; wins: number; scores: number[] }>();
  completed.forEach((record) => {
    const a = modelMap.get(record.modelA) ?? { total: 0, wins: 0, scores: [] };
    a.total += 1; a.wins += record.preferredResponse === "a" ? 1 : 0; if (record.normalizedScoreA !== null) a.scores.push(record.normalizedScoreA); modelMap.set(record.modelA, a);
    const b = modelMap.get(record.modelB) ?? { total: 0, wins: 0, scores: [] };
    b.total += 1; b.wins += record.preferredResponse === "b" ? 1 : 0; if (record.normalizedScoreB !== null) b.scores.push(record.normalizedScoreB); modelMap.set(record.modelB, b);
  });
  const models = Array.from(modelMap, ([name, value]) => ({ name, evaluations: value.total, wins: value.wins, averageScore: value.scores.length ? Math.round(value.scores.reduce((sum, score) => sum + score, 0) / value.scores.length * 10) / 10 : null }));
  return Response.json({ total: records.length, completed: completed.length, preference, activity: Array.from(byDate, ([date, count]) => ({ date, count })), criterion, models, smallSample: completed.length < 10 }, { headers: { "Cache-Control": "no-store" } });
}
import { env } from "cloudflare:workers";
