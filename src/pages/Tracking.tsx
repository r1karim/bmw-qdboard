import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDefects } from "../context/DefectsContext";
import { useTracking, type InvestigationStatus } from "../context/TrackingContext";
import type { DefectRow } from "../components/defects/tableConfig";
import DefectInvestigationPanel from "../components/tracking/DefectInvestigationPanel";
import TrackingSummary from "../components/tracking/TrackingSummary";
import TrackingTable from "../components/tracking/TrackingTable";

type StatusFilter = "All" | InvestigationStatus;
type SortBy = "recent" | "oldest" | "severity" | "id";

export default function Tracking() {
    const { defects, loading, error } = useDefects();
    const { records, unflag } = useTracking();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [sortBy, setSortBy] = useState<SortBy>("recent");
    const [selectedDefect, setSelectedDefect] = useState<DefectRow | null>(null);

    const trackedRecords = useMemo(() => Object.values(records), [records]);
    const defectMap = useMemo(() => new Map(defects.map(defect => [String(defect["Defect ID"] ?? ""), defect as DefectRow])), [defects]);

    const items = useMemo(() => {
        const query = search.trim().toLowerCase();
        return trackedRecords
            .map(record => ({ record, defect: defectMap.get(record.defectId) ?? null }))
            .filter(({ record, defect }) => {
                if (statusFilter !== "All" && record.investigationStatus !== statusFilter) return false;
                if (!query) return true;
                return [record.defectId, record.note, record.investigationStatus, defect?.VIN, defect?.["Defect Name"], defect?.["Resolution Status"]]
                    .some(value => String(value ?? "").toLowerCase().includes(query));
            })
            .sort((a, b) => {
                if (sortBy === "oldest") return a.record.updatedAt.localeCompare(b.record.updatedAt);
                if (sortBy === "id") return a.record.defectId.localeCompare(b.record.defectId, undefined, { numeric: true });
                if (sortBy === "severity") {
                    const left = Number(a.defect?.["Severity Rating"]);
                    const right = Number(b.defect?.["Severity Rating"]);
                    const validLeft = a.defect?.["Severity Rating"] != null && Number.isFinite(left);
                    const validRight = b.defect?.["Severity Rating"] != null && Number.isFinite(right);
                    if (!validLeft && !validRight) return 0;
                    if (!validLeft) return 1;
                    if (!validRight) return -1;
                    return left - right; // Lower rating = higher severity.
                }
                return b.record.updatedAt.localeCompare(a.record.updatedAt);
            });
    }, [trackedRecords, defectMap, search, statusFilter, sortBy]);

    function handleUnflag(defectId: string) {
        if (window.confirm(`Remove ${defectId} from tracking? Its engineer note will also be deleted.`)) unflag(defectId);
    }

    if (loading) return <p className="text-gray-400">Loading investigations...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    return (
        <div className="w-full min-w-0 space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-white">Investigation Tracking</h1>
                <p className="mt-1 text-sm text-zinc-500">Manage flagged quality defects independently of manufacturing resolution.</p>
            </div>
            <TrackingSummary records={trackedRecords} />
            <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-zinc-400">{items.length.toLocaleString()} of {trackedRecords.length.toLocaleString()} investigations</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#252631] px-3 py-2">
                            <Search size={15} className="text-zinc-500" />
                            <input aria-label="Search investigations" placeholder="Search investigations..." value={search} onChange={event => setSearch(event.target.value)} className="w-52 bg-transparent text-xs text-white outline-none placeholder:text-zinc-500" />
                        </label>
                        <select aria-label="Filter investigation status" value={statusFilter} onChange={event => setStatusFilter(event.target.value as StatusFilter)} className="rounded-lg border border-white/10 bg-[#252631] px-3 py-2 text-xs text-white">
                            {["All", "To Review", "Investigating", "Closed"].map(status => <option key={status} value={status}>{status === "All" ? "All statuses" : status}</option>)}
                        </select>
                        <select aria-label="Sort investigations" value={sortBy} onChange={event => setSortBy(event.target.value as SortBy)} className="rounded-lg border border-white/10 bg-[#252631] px-3 py-2 text-xs text-white">
                            <option value="recent">Recently updated</option>
                            <option value="oldest">Oldest updated</option>
                            <option value="severity">Highest severity</option>
                            <option value="id">Defect ID</option>
                        </select>
                    </div>
                </div>
            </div>
            <TrackingTable items={items} onEdit={setSelectedDefect} onUnflag={handleUnflag} />
            <DefectInvestigationPanel defect={selectedDefect} onClose={() => setSelectedDefect(null)} />
        </div>
    );
}
