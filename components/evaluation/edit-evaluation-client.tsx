"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EvaluationRecord } from "@/lib/types";
import { EvaluationForm } from "./evaluation-form";
import { OwnerToken } from "@/components/ui/owner-token";

export function EditEvaluationClient({ id }: { id: string }) {
  const [record, setRecord] = useState<EvaluationRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("evallens-owner-token") ?? "";
    if (!token) { setError("Owner authorization is required to edit this record."); return; }
    fetch(`/api/evaluations/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => { if (!ok) throw new Error(body.error); setRecord(body.evaluation); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load evaluation"));
  }, [id]);

  if (error) return <div className="space-y-4"><OwnerToken/><div className="panel p-6 text-sm">{error}</div><Link className="btn btn-secondary" href="/evaluations/history">Back to history</Link></div>;
  if (!record) return <div className="panel animate-pulse p-10 text-center text-[var(--muted)]">Loading owner record…</div>;
  return <EvaluationForm initialData={record} evaluationId={id}/>;
}
