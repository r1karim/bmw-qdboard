import { useMemo, useState } from "react";
import { useDefects } from "../context/DefectsContext";
import { useTracking } from "../context/TrackingContext";
import type { DefectRow } from "../components/defects/tableConfig";
import DefectInvestigationPanel from "../components/tracking/DefectInvestigationPanel";
import TrackingSummary from "../components/tracking/TrackingSummary";
import TrackingTable from "../components/tracking/TrackingTable";
import ChartSnapshotsTable from "../components/tracking/ChartSnapshotsTable";

type TrackingTab = "defects" | "snapshots";

export default function Tracking() {
    const { defects, loading, error } = useDefects();
    const { records, unflag } = useTracking();
    const [tab, setTab] = useState<TrackingTab>("defects");
    const [selectedDefect, setSelectedDefect] = useState<DefectRow | null>(null);

    const trackedRecords = useMemo(() => Object.values(records), [records]);
    const defectMap = useMemo(() => new Map(defects.map(defect => [String(defect["Defect ID"] ?? ""), defect as DefectRow])), [defects]);

    // Connect saved investigation to their defect report
    const items = useMemo(() =>
            trackedRecords.map(record => ({
                record,
                defect: defectMap.get(record.defectId) ?? null,
            })),
        [trackedRecords, defectMap]
    );

    function handleUnflag(defectId: string) {
        if (window.confirm(`Remove ${defectId} from tracking? Its engineer note will also be deleted.`)) unflag(defectId);
    }

    if (loading) return <p className="text-gray-400">Loading investigations...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    return (
        <div className="w-full min-w-0 space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-white">Investigation Tracking</h1>
                <p className="mt-1 text-sm text-zinc-500">Manage flagged quality defects and saved chart observations.</p>
            </div>
            <div className="flex gap-2 border-b border-white/10 pb-3">
                <button type="button" onClick={() => setTab("defects")} className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === "defects" ? "bg-violet-600 text-white" : "bg-white/5 text-zinc-400 hover:text-white"}`}>Flagged Defects</button>
                <button type="button" onClick={() => setTab("snapshots")} className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === "snapshots" ? "bg-violet-600 text-white" : "bg-white/5 text-zinc-400 hover:text-white"}`}>Chart Snapshots</button>
            </div>
            {tab === "snapshots" ? (
                <ChartSnapshotsTable />
            ) : (
                <>
                    <TrackingSummary records={trackedRecords} />
                    <TrackingTable items={items} onEdit={setSelectedDefect} onUnflag={handleUnflag} />
                    <DefectInvestigationPanel defect={selectedDefect} onClose={() => setSelectedDefect(null)} />
                </>
            )}
        </div>
    );
}
