
import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    deleteChartSnapshot,
    getChartSnapshots,
    updateChartSnapshotNote,
    type ChartSnapshot,
} from "../../utils/chartSnapshots";

export default function ChartSnapshotsTable() {
    const [snapshots, setSnapshots] = useState<ChartSnapshot[]>(getChartSnapshots);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");

    function refresh() {
        setSnapshots(getChartSnapshots());
    }

    function startEdit(snapshot: ChartSnapshot) {
        setEditingId(snapshot.id);
        setDraft(snapshot.note);
    }

    function saveEdit(id: string) {
        if (!draft.trim()) return;
        updateChartSnapshotNote(id, draft.trim());
        setEditingId(null);
        refresh();
    }

    function remove(id: string) {
        if (!window.confirm("Delete this chart snapshot and its note?")) return;
        deleteChartSnapshot(id);
        if (editingId === id) setEditingId(null);
        refresh();
    }

    const columns: GridColDef[] = [
        { field: "category", headerName: "Category", minWidth: 130, flex: 1 },
        {
            field: "dateFrom",
            headerName: "Date Range",
            minWidth: 220,
            flex: 1,
            renderCell: params => `${params.row.dateFrom} – ${params.row.dateTo}`,
        },
        {
            field: "reportCount",
            headerName: "Reports",
            type: "number",
            minWidth: 110,
            flex: 1,
            valueFormatter: value => Number(value).toLocaleString(),
        },
        {
            field: "note",
            headerName: "Engineer Note",
            minWidth: 300,
            flex: 2,
            sortable: false,
            renderCell: params =>
                editingId === params.row.id ? (
                    <textarea
                        aria-label={`Edit note for ${params.row.category}`}
                        value={draft}
                        onChange={event => setDraft(event.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-[#252631] p-2 text-xs text-white outline-none focus:border-violet-500"
                    />
                ) : (
                    <span className="block truncate" title={params.value}>
                        {params.value}
                    </span>
                ),
        },
        {
            field: "createdAt",
            headerName: "Saved At",
            minWidth: 190,
            flex: 1,
            renderCell: params => new Date(String(params.value)).toLocaleString(),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 160,
            sortable: false,
            filterable: false,
            renderCell: params => (
                <div className="flex h-full items-center gap-3">
                    {editingId === params.row.id ? (
                        <>
                            <button type="button" disabled={!draft.trim()} onClick={() => saveEdit(params.row.id)}
                                    className="text-violet-400 hover:text-violet-300 disabled:opacity-30">Save</button>
                            <button type="button" onClick={() => setEditingId(null)}
                                    className="text-zinc-400 hover:text-white">Cancel</button>
                        </>
                    ) : (
                        <button type="button" onClick={() => startEdit(params.row)}
                                className="text-violet-400 hover:text-violet-300">Edit</button>
                    )}
                    <button type="button" onClick={() => remove(params.row.id)}
                            className="text-red-400 hover:text-red-300">Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">
            <DataGrid
                rows={snapshots}
                columns={columns}
                showToolbar
                disableRowSelectionOnClick
                getRowHeight={({ id }) => editingId === id ? 110 : 40}
                columnHeaderHeight={38}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 10 } },
                    sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
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
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                    },
                }}
                localeText={{ noRowsLabel: "No chart snapshots saved yet." }}
            />
        </div>
    );
}
