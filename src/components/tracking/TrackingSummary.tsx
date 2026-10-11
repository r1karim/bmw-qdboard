import type { TrackingRecord, InvestigationStatus } from "../../context/TrackingContext";

/**
 * Props for the investigation summary component.
 */
type Props = { records: TrackingRecord[] };

// Supported investigation statuses used to calculate summary counts.
const STATUSES: InvestigationStatus[] = ["To Review", "Investigating", "Closed"];

/**
 * Displays summary statistics for tracked defect investigations.
 *
 * Shows the total number of flagged defects and the number of
 * investigations in each workflow status.
 *
 * @param records - Saved investigation records used to calculate statistics.
 */
export default function TrackingSummary({ records }: Props) {
    // Calculate the total number of flagged defects and counts for each status.
    const stats = [{ label: "Total Flagged", count: records.length }, ...STATUSES.map(status => ({
        label: status,
        count: records.filter(record => record.investigationStatus === status).length,
    }))];

    return (
        // Display the four summary cards in a responsive grid.
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