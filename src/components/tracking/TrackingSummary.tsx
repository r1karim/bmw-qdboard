import type { TrackingRecord, InvestigationStatus } from "../../context/TrackingContext";

type Props = { records: TrackingRecord[] };
const STATUSES: InvestigationStatus[] = ["To Review", "Investigating", "Closed"];

export default function TrackingSummary({ records }: Props) {
    const stats = [{ label: "Total Flagged", count: records.length }, ...STATUSES.map(status => ({
        label: status,
        count: records.filter(record => record.investigationStatus === status).length,
    }))];
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(stat => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-[#191a22] p-5">
                    <p className="text-xs text-zinc-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.count.toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}
