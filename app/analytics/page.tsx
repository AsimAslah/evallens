import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsClient } from "@/components/charts/analytics-client";
export default function Analytics(){return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><PageHeader eyebrow="Stored evidence" title="Evaluation analytics" description="Interactive summaries calculated from actual saved records. No fabricated benchmarks, improvements, or model rankings."/><div className="mt-8"><AnalyticsClient/></div></div>}
