import { PageHeader } from "@/components/ui/page-header";
import { HistoryClient } from "@/components/history/history-client";
export default function History(){return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><PageHeader eyebrow="Evidence archive" title="Evaluation history" description="Search saved records, inspect rationales, export data, and manage publication-aware evaluation history."/><div className="mt-8"><HistoryClient/></div></div>}
