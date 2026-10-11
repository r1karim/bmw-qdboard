
import { useMemo, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
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

    const columns: GridColDef[] = [
        { field: "label", headerName: isVin ? "VIN" : "Defect ID", flex: 1, minWidth: 160 },
        ...(!isVin ? [
            { field: "vin", headerName: "VIN", flex: 1, minWidth: 160 },
            { field: "station", headerName: "Station", flex: 1, minWidth: 120 },
            { field: "date", headerName: "Date", flex: 1, minWidth: 120 },
        ] as GridColDef[] : []),
        {
            field: "value",
            headerName: isSeverity ? "Severity Rating" : isVin ? "Report Count" : "Hours",
            type: "number",
            width: 140,
            renderCell: params => (
                <span className="font-semibold text-violet-400">
                    {isSeverity || isVin ? params.value : Number(params.value).toFixed(2)}
                </span>
            ),
        },
        { field: "reason", headerName: "Why flagged?", flex: 2, minWidth: 250 },
        {
            field: "actions",
            headerName: "Investigation",
            width: isVin ? 250 : 140,
            sortable: false,
            filterable: false,
            renderCell: params => {
                const item = params.row as OutlierItem & { reason: string };
                const defect = isVin ? null : defectsById.get(String(item.id)) ?? defectsById.get(String(item.label)) ?? null;
                const defectId = defect ? String(defect["Defect ID"] ?? "") : "";
                const tracked = Boolean(defectId && records[defectId]);

                if (isVin) {
                    const vin = String(item.label);
                    const expanded = expandedVin === vin;
                    const vinReports = defectsByVin.get(vin) ?? [];

                    return (
                        <div className="flex flex-col items-start gap-2 py-2">
                            <button type="button" onClick={() => setExpandedVin(expanded ? null : vin)}
                                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10">
                                {expanded ? "Hide reports" : "Review reports"}
                            </button>
                            {expanded && (
                                <div className="w-full rounded-lg border border-white/10 bg-[#252631] p-2">
                                    {vinReports.length === 0 ? (
                                        <p className="p-2 text-xs text-zinc-400">No reports found for this VIN in the selected date range.</p>
                                    ) : (
                                        <div className="max-h-60 space-y-1 overflow-y-auto">
                                            {vinReports.map((report, index) => {
                                                const id = String(report["Defect ID"] ?? "");
                                                return (
                                                    <button key={`${id}-${index}`} type="button" onClick={() => setSelectedDefect(report)}
                                                            className="flex w-full items-center justify-between gap-3 rounded px-2 py-2 text-left text-xs text-zinc-200 hover:bg-white/10">
                                                        <span>
                                                            <span className="font-medium">{id}</span>
                                                            <span className="mt-1 block text-zinc-400">{String(report["Defect Name"] ?? "Unknown defect")}</span>
                                                        </span>
                                                        <Flag size={15} className={records[id] ? "shrink-0 fill-violet-500 text-violet-400" : "shrink-0 text-zinc-500"} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <button type="button" disabled={!defect} onClick={() => setSelectedDefect(defect)}
                            title={defect ? (tracked ? "Edit investigation" : "Flag and investigate") : "Defect record not found"}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                        <Flag size={14} className={tracked ? "fill-violet-500 text-violet-400" : "text-zinc-400"} />
                        {tracked ? "Edit" : "Flag"}
                    </button>
                );
            },
        },
    ];

    const rows = flagged.map(item => ({
        ...item,
        reason: isSeverity
            ? `Rating ${item.value} is ≤ ${threshold} (1 = most severe).`
            : isVin
                ? `${item.value} reports for this VIN (more than 1).`
                : `${item.value.toFixed(2)} hours exceeds the ${threshold.toFixed(2)}-hour threshold.`,
    }));

    return (
        <>
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Flagged Outliers</h2>
                    <p className="mt-1 text-xs text-gray-400">
                        {flagged.length.toLocaleString()} flagged {isVin ? "VINs" : "defect reports"}.
                    </p>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">
                    <DataGrid
                        key={metric}
                        rows={rows}
                        columns={columns}
                        disableRowSelectionOnClick
                        getRowHeight={({ id }) =>
                            isVin && expandedVin === rows.find(row => row.id === id)?.label ? "auto" : null
                        }
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { page: 0, pageSize: 10 } },
                            sorting: { sortModel: [{ field: "value", sort: isSeverity ? "asc" : "desc" }] },
                        }}
                        sx={{
                            border: 0,
                            "& .MuiDataGrid-cell": { borderColor: "rgba(255,255,255,0.05)" },
                            "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                        }}
                        localeText={{ noRowsLabel: "No flagged observations." }}
                    />
                </div>
            </div>
            <DefectInvestigationPanel defect={selectedDefect} onClose={() => setSelectedDefect(null)} />
        </>
    );
}
