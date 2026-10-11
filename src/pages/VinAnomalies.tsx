
import { useMemo, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useDefects } from "../context/DefectsContext";
import { detectVinAnomalies } from "../utils/vinAnomalies";

/**
 * VIN Anomalies page for detecting inconsistent vehicle attributes
 * across defect reports associated with the same VIN.
 *
 * Displays anomaly statistics, an interactive table of affected VINs,
 * and expandable details showing conflicting values and source reports.
 *
 * The page identifies inconsistencies but does not determine which
 * reported vehicle attributes are correct.
 */
export default function VinAnomalies() {
    const { defects, loading, error } = useDefects();

    // Track the VIN whose detailed reports are currently displayed.
    // Only one VIN can be expanded at a time.
    const [expandedVin, setExpandedVin] = useState<string | null>(null);

    // Detect VINs with conflicting vehicle attributes across their reports.
    // Recalculate only when the defect dataset changes.
    const anomalies = useMemo(
        () => detectVinAnomalies(defects),
        [defects]
    );

    // Count all defect reports associated with anomalous VINs.
    const affectedReports = useMemo(
        () => anomalies.reduce((sum, item) => sum + item.reportCount, 0),
        [anomalies]
    );

    // Define the columns and custom cell rendering for the anomalies table.
    const columns: GridColDef[] = [
        {
            field: "vin",
            headerName: "VIN",
            minWidth: 200,
            flex: 1,
            renderCell: params => (
                <span className="flex items-center gap-3 font-medium text-white">
                    <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                    {params.value}
                </span>
            ),
        },
        {
            field: "conflictingFields",
            headerName: "Conflicting Attributes",
            minWidth: 250,
            flex: 2,
            valueGetter: (_value, row) => row.conflictingFields.join(", "),
        },
        {
            field: "reportCount",
            headerName: "Reports",
            type: "number",
            width: 120,
        },
        {
            field: "actions",
            headerName: "Details",
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: params => {
                const expanded = expandedVin === params.row.vin;

                return (
                    <button
                        type="button"
                        onClick={() => setExpandedVin(expanded ? null : params.row.vin)}
                        className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300"
                    >
                        {expanded ? "Hide reports" : "View reports"}
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                );
            },
        },
    ];

    if (loading) {
        return <p className="p-6 text-zinc-400">Loading VIN anomalies...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-400">{error}</p>;
    }

    return (
        <div className="space-y-6 p-6 text-white">
            <div>
                <h1 className="text-2xl font-semibold">VIN Anomalies</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Detect inconsistent vehicle attributes across defect reports.
                    These anomalies require verification against trusted vehicle records.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Anomalous VINs" value={anomalies.length} />
                <SummaryCard label="Affected Reports" value={affectedReports} />
                <SummaryCard label="Attributes Checked" value={3} />
            </div>

            {/* Main anomalies table and selected VIN's detailed reports. */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">
                <div className="border-b border-white/10 px-4 py-4">
                    <h2 className="text-sm font-semibold">Inconsistent Vehicle Records</h2>
                </div>

                <DataGrid
                    rows={anomalies}
                    getRowId={row => row.vin}
                    columns={columns}
                    showToolbar
                    disableRowSelectionOnClick
                    rowHeight={44}
                    columnHeaderHeight={38}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 10 } },
                        sorting: { sortModel: [{ field: "reportCount", sort: "desc" }] },
                    }}
                    sx={{
                        border: 0,
                        color: "#d4d4d8",
                        fontSize: 12,
                        backgroundColor: "#191a22",
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: "#20212b",
                            color: "#a1a1aa",
                        },
                        "& .MuiDataGrid-cell": {
                            borderColor: "rgba(255,255,255,0.05)",
                        },
                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: "rgba(255,255,255,0.04)",
                        },
                        "& .MuiDataGrid-toolbarContainer": {
                            padding: "12px 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                        },
                    }}
                    localeText={{ noRowsLabel: "No VIN anomalies found." }}
                />

                {expandedVin && anomalies.filter(item => item.vin === expandedVin).map(item => (
                    <div key={item.vin} className="space-y-4 border-t border-white/10 bg-[#20212b] p-4">
                        <h3 className="text-sm font-semibold text-white">
                            Reports for {item.vin}
                        </h3>

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-zinc-300">Conflicting values</h4>
                            {item.conflictingFields.map(field => (
                                <p key={field} className="text-sm">
                                    <span className="text-zinc-400">{field}: </span>
                                    <span className="text-amber-300">{item.values[field].join(" / ")}</span>
                                </p>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-white/10 text-zinc-400">
                                <tr>
                                    {["Defect ID", "Car Model", "Motor Type", "Design Package"].map(column => (
                                        <th key={column} className="px-3 py-2">{column}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {item.reports.map((report, index) => (
                                    <tr key={`${String(report["Defect ID"])}-${index}`} className="border-b border-white/5">
                                        {(["Defect ID", "Car Model", "Motor Type", "Design Package"] as const).map(field => (
                                            <td
                                                key={field}
                                                className={`px-3 py-2 ${field !== "Defect ID" && item.conflictingFields.includes(field) ? "text-amber-300" : ""}`}
                                            >
                                                {String(report[field] ?? "—")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-xs text-zinc-500">
                            Conflicting records are highlighted. The correct values cannot be determined
                            from defect reports alone.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-4">
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</p>
        </div>
    );
}
