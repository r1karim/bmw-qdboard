import { useMemo, useState } from "react";
import { Flag } from "lucide-react";
import type { OutlierItem, OutlierMetric } from "../../utils/outliers";
import type { DefectRow } from "../defects/tableConfig";
import DefectInvestigationPanel from "../tracking/DefectInvestigationPanel";
import { useTracking } from "../../context/TrackingContext";

type Props = {
    flagged: OutlierItem[];
    metric: OutlierMetric;
    threshold: number;
    defects: DefectRow[];
};

export default function OutlierResultsTable({ flagged, metric, threshold, defects }: Props) {
    const shown = flagged.slice(0, 10);
    const isVin = metric === "vin";
    const isSeverity = metric === "severity";
    const { records } = useTracking();
    const [selectedDefect, setSelectedDefect] = useState<DefectRow | null>(null);
    const [expandedVin, setExpandedVin] = useState<string | null>(null);

    const defectsById = useMemo(() => {
        const map = new Map<string, DefectRow>();
        for (const defect of defects) map.set(String(defect["Defect ID"] ?? ""), defect);
        return map;
    }, [defects]);

    const defectsByVin = useMemo(() => {
        const map = new Map<string, DefectRow[]>();
        for (const defect of defects) {
            const vin = String(defect["VIN"] ?? "");
            if (!vin) continue;
            const group = map.get(vin) ?? [];
            group.push(defect);
            map.set(vin, group);
        }
        return map;
    }, [defects]);

    return (
        <>
            <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
                <h2 className="text-lg font-semibold text-white">Flagged Outliers</h2>
                <p className="mt-1 text-xs text-gray-400">
                    Showing {shown.length} {isSeverity ? "most critical" : "highest"} values out of {flagged.length.toLocaleString()} flagged {isVin ? "VINs" : "defect reports"}.
                </p>
                <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 text-gray-400">
                            <tr>
                                <th className="pb-3 pr-4">{isVin ? "VIN" : "Defect ID"}</th>
                                {!isVin && <th className="pb-3 pr-4">VIN</th>}
                                {!isVin && <th className="pb-3 pr-4">Station</th>}
                                {!isVin && <th className="pb-3 pr-4">Date</th>}
                                <th className="pb-3 pr-4">{isSeverity ? "Severity Rating" : isVin ? "Report Count" : "Hours"}</th>
                                <th className="pb-3 pr-4">Why flagged?</th>
                                <th className="pb-3 text-right">Investigation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map((item) => {
                                const defect = isVin ? null : defectsById.get(String(item.id)) ?? defectsById.get(String(item.label)) ?? null;
                                const defectId = defect ? String(defect["Defect ID"] ?? "") : "";
                                const tracked = Boolean(defectId && records[defectId]);
                                const vin = String(item.label);
                                const expanded = isVin && expandedVin === vin;
                                const vinReports = isVin ? defectsByVin.get(vin) ?? [] : [];
                                return (
                                    <tr key={item.id} className="border-b border-white/5 text-white">
                                        <td className="py-3 pr-4">{item.label}</td>
                                        {!isVin && <td className="py-3 pr-4">{item.vin ?? "—"}</td>}
                                        {!isVin && <td className="py-3 pr-4">{item.station ?? "—"}</td>}
                                        {!isVin && <td className="py-3 pr-4">{item.date}</td>}
                                        <td className="py-3 pr-4 font-semibold text-violet-400">
                                            {isSeverity || isVin ? item.value : item.value.toFixed(2)}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-400">
                                            {isSeverity
                                                ? `Rating ${item.value} is ≤ ${threshold} (1 = most severe).`
                                                : isVin
                                                    ? `${item.value} reports for this VIN (more than 1).`
                                                    : `${item.value.toFixed(2)} hours exceeds the ${threshold.toFixed(2)}-hour threshold.`}
                                        </td>
                                        <td className="py-3 text-right">
                                            {isVin ? (
                                                <div className="flex flex-col items-end gap-2">
                                                    <button type="button" onClick={() => setExpandedVin(expanded ? null : vin)}
                                                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10">
                                                        {expanded ? "Hide reports" : "Review reports"}
                                                    </button>
                                                    {expanded && (
                                                        <div className="min-w-64 max-w-sm rounded-lg border border-white/10 bg-[#252631] p-2 text-left">
                                                            {vinReports.length === 0 ? (
                                                                <p className="p-2 text-xs text-zinc-400">No reports found for this VIN in the selected date range.</p>
                                                            ) : (
                                                                <div className="max-h-60 space-y-1 overflow-y-auto">
                                                                    {vinReports.map((report, index) => {
                                                                        const id = String(report["Defect ID"] ?? "");
                                                                        return (
                                                                            <button key={`${id}-${index}`} type="button" onClick={() => setSelectedDefect(report)}
                                                                                className="flex w-full items-center justify-between gap-3 rounded px-2 py-2 text-left text-xs text-zinc-200 hover:bg-white/10">
                                                                                <span><span className="font-medium">{id}</span><span className="mt-1 block text-zinc-400">{String(report["Defect Name"] ?? "Unknown defect")}</span></span>
                                                                                <Flag size={15} className={records[id] ? "shrink-0 fill-violet-500 text-violet-400" : "shrink-0 text-zinc-500"} />
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button type="button" disabled={!defect} onClick={() => setSelectedDefect(defect)}
                                                    title={defect ? (tracked ? "Edit investigation" : "Flag and investigate") : "Defect record not found"}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                                                    <Flag size={14} className={tracked ? "fill-violet-500 text-violet-400" : "text-zinc-400"} />
                                                    {tracked ? "Edit" : "Flag"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {shown.length === 0 && (
                                <tr><td colSpan={isVin ? 4 : 7} className="py-6 text-center text-gray-400">No flagged observations.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <DefectInvestigationPanel defect={selectedDefect} onClose={() => setSelectedDefect(null)} />
        </>
    );
}
