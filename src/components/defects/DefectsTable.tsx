import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Flag, MessageSquareText } from "lucide-react";
import { useTracking } from "../../context/TrackingContext";
import DefectInvestigationPanel from "../tracking/DefectInvestigationPanel";
import { COLUMNS, type DefectRow } from "./tableConfig";
export type { DefectRow } from "./tableConfig";

/**
 * Displays defect reports in an interactive MUI Data Grid.
 *
 * Supports searching, filtering, sorting, and pagination through MUI,
 * as well as flagging defects and managing engineer notes.
 *
 * @param defects - Array of defect reports to display.
 */
export default function DefectsTable({ defects }: { defects: DefectRow[] }) {
    const { records } = useTracking();
    const [selectedDefect, setSelectedDefect] = useState<DefectRow | null>(null);

    const rows = defects.map((defect, index) => ({
        ...defect,
        id: index,
        engineerNote: records[String(defect["Defect ID"] ?? "")]?.note ?? "",
    }));

    const columns: GridColDef[] = [
        {
            field: "flag",
            headerName: "Flag",
            width: 65,
            sortable: false,
            filterable: false,
            renderCell: params => {
                const defect = params.row as DefectRow;
                const defectId = String(defect["Defect ID"] ?? "");
                const record = records[defectId];

                return (
                    <button type="button" onClick={() => setSelectedDefect(defect)}
                            title={record ? `Flagged: ${record.investigationStatus}` : "Flag defect"}
                            className={record ? "text-violet-400 hover:text-violet-300" : "text-zinc-500 hover:text-violet-400"}>
                        <Flag size={16} fill={record ? "currentColor" : "none"} />
                    </button>
                );
            },
        },
        {
            field: "engineerNote",
            headerName: "Engineer Note",
            width: 235,
            sortable: false,
            renderCell: params => {
                const defect = params.row as DefectRow;
                const record = records[String(defect["Defect ID"] ?? "")];

                return (
                    <button type="button" onClick={() => setSelectedDefect(defect)}
                            title={record?.note || "Add engineer note"}
                            className="flex w-full items-center gap-2 text-left text-zinc-300 hover:text-violet-300">
                        <MessageSquareText size={14} className="shrink-0" />
                        <span className="truncate">
                            {record?.note || (record ? "Edit note" : "+ Add note")}
                        </span>
                    </button>
                );
            },
        },
        ...COLUMNS.map(column => ({
            field: column,
            headerName: column,
            minWidth: 140,
            width: 155,
            valueFormatter: (value: unknown) =>
                value == null || value === "" ? "—" : String(value),
        })),
    ];

    return (
        <>
            <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">
                <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-sm font-semibold text-white">Defect Records</h2>
                    <p className="mt-1 text-xs text-zinc-500">
                        {defects.length.toLocaleString()} reports
                    </p>
                </div>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    showToolbar
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 25 } },
                        sorting: { sortModel: [{ field: "Report Date", sort: "desc" }] },
                    }}
                    rowHeight={40}
                    columnHeaderHeight={38}
                    sx={{
                        border: 0,
                        color: "#d4d4d8",
                        fontSize: 12,
                        backgroundColor: "#191a22",

                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: "#20212b",
                            color: "#a1a1aa",
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontSize: 12,
                            fontWeight: 500,
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
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                        },
                        "& .MuiDataGrid-columnSeparator": {
                            color: "rgba(255,255,255,0.08)",
                        },
                    }}
                    localeText={{
                        noRowsLabel: "No matching defect reports found.",
                    }}
                />
            </div>

            <DefectInvestigationPanel
                defect={selectedDefect}
                onClose={() => setSelectedDefect(null)}
            />
        </>
    );
}
