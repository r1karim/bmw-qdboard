import type { TrackingRecord } from "../../context/TrackingContext";
import type { DefectRow } from "../defects/tableConfig";

type TrackingItem = { record: TrackingRecord; defect: DefectRow | null };

type Props = {
    items: TrackingItem[];
    onEdit: (defect: DefectRow) => void;
    onUnflag: (defectId: string) => void;
};

export default function TrackingTable({ items, onEdit, onUnflag }: Props) {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#191a22]">
            <table className="w-full min-w-[1000px] text-left text-xs">
                <thead className="bg-[#20212b] text-zinc-400">
                <tr>
                    {["Defect ID", "Defect", "VIN", "Severity", "Resolution", "Investigation", "Engineer Note", "Last Updated", "Actions"].map(column => (
                        <th key={column} className="px-4 py-3 font-medium">{column}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {items.map(({ record, defect }) => (
                    <tr key={record.defectId} className="border-t border-white/5 text-zinc-300 hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-white">{record.defectId}</td>
                        <td className="max-w-48 truncate px-4 py-3" title={String(defect?.["Defect Name"] ?? "")}>{String(defect?.["Defect Name"] ?? "—")}</td>
                        <td className="px-4 py-3">{String(defect?.VIN ?? "—")}</td>
                        <td className="px-4 py-3">{String(defect?.["Severity Rating"] ?? "—")}</td>
                        <td className="px-4 py-3">{String(defect?.["Resolution Status"] ?? "—")}</td>
                        <td className="px-4 py-3"><span className="rounded-md bg-violet-500/10 px-2 py-1 text-violet-300">{record.investigationStatus}</span></td>
                        <td className="max-w-64 truncate px-4 py-3" title={record.note}>{record.note || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(record.updatedAt).toLocaleString()}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                            <button type="button" disabled={!defect} onClick={() => defect && onEdit(defect)} className="mr-3 text-violet-400 hover:text-violet-300 disabled:opacity-30">Edit</button>
                            <button type="button" onClick={() => onUnflag(record.defectId)} className="text-red-400 hover:text-red-300">Unflag</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {items.length === 0 && <p className="p-10 text-center text-sm text-zinc-500">No matching investigations found.</p>}
        </div>
    );
}