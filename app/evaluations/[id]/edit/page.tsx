import { EditEvaluationClient } from "@/components/evaluation/edit-evaluation-client";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditEvaluation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><PageHeader eyebrow="Owner workflow" title="Edit evaluation" description="Update the comparison, scores, evidence, status, or publication approval. Changes are validated again on the server."/><div className="mt-8"><EditEvaluationClient id={id}/></div></div>;
}
