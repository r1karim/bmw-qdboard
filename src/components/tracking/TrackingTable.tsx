import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import type { TrackingRecord } from "../../context/TrackingContext";
import type { DefectRow } from "../defects/tableConfig";

type TrackingItem = {
    record: TrackingRecord;
    defect: DefectRow | null;
};

type Props = {
    items: TrackingItem[];
    onEdit: (defect: DefectRow) => void;
    onUnflag: (defectId: string) => void;
};

export default function TrackingTable({ items, onEdit, onUnflag }: Props) {
    const rows = items.map(({ record, defect }) => ({
        id: record.defectId,
        defect: String(defect?.["Defect Name"] ?? "—"),
        vin: String(defect?.VIN ?? "—"),
        severity: defect?.["Severity Rating"] == null
            ? null
            : Number(defect["Severity Rating"]),
        resolution: String(defect?.["Resolution Status"] ?? "—"),
        investigation: record.investigationStatus,
        note: record.note,
        updatedAt: record.updatedAt,
        defectRow: defect,
    }));

    const columns: GridColDef[] = [
        { field: "id", headerName: "Defect ID", minWidth: 160, flex: 1 },
        { field: "defect", headerName: "Defect", minWidth: 150, flex: 1 },
        { field: "vin", headerName: "VIN", minWidth: 160, flex: 1 },
        { field: "severity", headerName: "Severity", type: "number", width: 100 },
        { field: "resolution", headerName: "Resolution", minWidth: 120, flex: 1 },
        {
            field: "investigation",
            headerName: "Investigation",
            type: "singleSelect",
            valueOptions: ["To Review", "Investigating", "Closed"],
            minWidth: 140,
            flex: 1,
            renderCell: params => (
                <span className="inline-block rounded-md px-2 py-1 text-violet-300">
                    {params.value}
                </span>
            ),
        },
        {
            field: "note",
            headerName: "Engineer Note",
            minWidth: 200,
            flex: 1.5,
            renderCell: params => (
                <span
                    className="block truncate"
                    title={String(params.value ?? "")}
                >
                    {params.value || "—"}
                </span>
            ),
        },
        {
            field: "updatedAt",
            headerName: "Last Updated",
            minWidth: 170,
            flex: 1,
            renderCell: params =>
                new Date(String(params.value)).toLocaleString(),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 130,
            sortable: false,
            filterable: false,
            renderCell: params => (
                <div className="flex h-full items-center gap-3">
                    <button
                        type="button"
                        disabled={!params.row.defectRow}
                        onClick={() => onEdit(params.row.defectRow)}
                        className="text-violet-400 hover:text-violet-300 disabled:opacity-30"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => onUnflag(params.row.id)}
                        className="text-red-400 hover:text-red-300"
                    >
                        Unflag
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">
            <DataGrid
                rows={rows}
                columns={columns}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                sx={{
                    border: 0,
                    color: "#d4d4d8",
                    fontSize: 12,
                    backgroundColor: "#191a22",
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#20212b",
                        color: "#a1a1aa",
                    },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: "#20212b",
                    },
                    "& .MuiDataGrid-cell": {
                        borderColor: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: "rgba(255,255,255,0.05)",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderColor: "rgba(255,255,255,0.1)",
                    },
                    "& .MuiTablePagination-root": {
                        color: "#a1a1aa",
                    },
                    "& .MuiSvgIcon-root": {
                        color: "#a1a1aa",
                    },
                    "& .MuiDataGrid-overlay": {
                        backgroundColor: "#191a22",
                    },
                }}
                localeText={{
                    noRowsLabel: "No matching investigations found.",
                }}
                showToolbar
            />
        </div>
    );
}
