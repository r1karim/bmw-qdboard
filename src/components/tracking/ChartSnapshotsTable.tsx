import { useState } from "react";
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

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#191a22]">
            <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-[#20212b] text-zinc-400">
                    <tr>
                        {["Category", "Date Range", "Reports", "Engineer Note", "Saved At", "Actions"].map(column => (
                            <th key={column} className="px-4 py-3 font-medium">{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {snapshots.map(snapshot => (
                        <tr key={snapshot.id} className="border-t border-white/5 text-zinc-300 hover:bg-white/5">
                            <td className="px-4 py-3 font-medium text-white">{snapshot.category}</td>
                            <td className="whitespace-nowrap px-4 py-3">{snapshot.dateFrom} – {snapshot.dateTo}</td>
                            <td className="px-4 py-3">{snapshot.reportCount.toLocaleString()}</td>
                            <td className="min-w-64 px-4 py-3">
                                {editingId === snapshot.id ? (
                                    <textarea
                                        aria-label={`Edit note for ${snapshot.category}`}
                                        value={draft}
                                        onChange={event => setDraft(event.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-white/10 bg-[#252631] p-2 text-xs text-white outline-none focus:border-violet-500"
                                    />
                                ) : (
                                    <span className="whitespace-pre-wrap break-words">{snapshot.note}</span>
                                )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">{new Date(snapshot.createdAt).toLocaleString()}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                {editingId === snapshot.id ? (
                                    <>
                                        <button type="button" disabled={!draft.trim()} onClick={() => saveEdit(snapshot.id)} className="mr-3 text-violet-400 hover:text-violet-300 disabled:opacity-30">Save</button>
                                        <button type="button" onClick={() => setEditingId(null)} className="mr-3 text-zinc-400 hover:text-white">Cancel</button>
                                    </>
                                ) : (
                                    <button type="button" onClick={() => startEdit(snapshot)} className="mr-3 text-violet-400 hover:text-violet-300">Edit</button>
                                )}
                                <button type="button" onClick={() => remove(snapshot.id)} className="text-red-400 hover:text-red-300">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {snapshots.length === 0 && (
                <p className="p-10 text-center text-sm text-zinc-500">No chart snapshots saved yet.</p>
            )}
        </div>
    );
}
