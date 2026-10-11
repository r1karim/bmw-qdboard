import { useEffect, useState } from "react";
import { Flag, X } from "lucide-react";
import { useTracking, type InvestigationStatus } from "../../context/TrackingContext";
import AIInvestigation from "./AIInvestigation";
import type { DefectRow } from "../defects/tableConfig";

type Props = { defect: DefectRow | null; onClose: () => void };
const STATUSES: InvestigationStatus[] = ["To Review", "Investigating", "Closed"];

export default function DefectInvestigationPanel({ defect, onClose }: Props) {
    const { records, saveRecord, unflag } = useTracking();
    const defectId = defect == null ? "" : String(defect["Defect ID"] ?? "");
    const record = records[defectId];
    const [note, setNote] = useState("");
    const [status, setStatus] = useState<InvestigationStatus>("To Review");

    useEffect(() => {
        setNote(record?.note ?? "");
        setStatus(record?.investigationStatus ?? "To Review");
    }, [defectId, record?.note, record?.investigationStatus]);

    useEffect(() => {
        if (!defect) return;
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [defect, onClose]);

    if (!defect) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <aside role="dialog" aria-modal="true" aria-label={`Investigation for ${defectId}`} className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#191a22] text-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/10 p-5">
                    <div>
                        <p className="text-xs text-violet-400">Quality investigation</p>
                        <h2 className="mt-1 text-base font-semibold">{defectId}</h2>
                        <p className="mt-1 text-xs text-zinc-400">{String(defect["Defect Name"] ?? "Unknown defect")}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close investigation panel" className="rounded p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); saveRecord(defectId, note, status); onClose(); }} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                    <div className="rounded-lg border border-white/10 bg-[#252631] p-3 text-xs text-zinc-300">
                        <p><span className="text-zinc-500">VIN:</span> {String(defect["VIN"] ?? "—")}</p>
                        <p className="mt-2"><span className="text-zinc-500">Resolution status:</span> {String(defect["Resolution Status"] ?? "—")}</p>
                        <p className="mt-2"><span className="text-zinc-500">Severity:</span> {String(defect["Severity Rating"] ?? "—")}</p>
                    </div>
                    <div>
                        <label htmlFor="investigation-status" className="mb-2 block text-xs font-medium text-zinc-300">Investigation status</label>
                        <select id="investigation-status" value={status} onChange={event => setStatus(event.target.value as InvestigationStatus)} className="w-full rounded-lg border border-white/10 bg-[#252631] px-3 py-2 text-sm text-white outline-none focus:border-violet-500">
                            {STATUSES.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="investigation-note" className="mb-2 block text-xs font-medium text-zinc-300">Engineer note</label>
                        <textarea id="investigation-note" value={note} onChange={event => setNote(event.target.value)} rows={7} placeholder="Describe the issue, findings, or next steps..." className="w-full resize-y rounded-lg border border-white/10 bg-[#252631] p-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-500" />
                    </div>
                    <AIInvestigation key={defectId} defect={defect} />
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                        {record ? <button type="button" onClick={() => { if (window.confirm(`Remove ${defectId} from investigation tracking? Its note will also be deleted.`)) { unflag(defectId); onClose(); } }} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"><Flag size={14} /> Unflag defect</button> : <span className="text-xs text-zinc-500">Saving will flag this defect.</span>}
                        <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">Save investigation</button>
                    </div>
                </form>
            </aside>
        </div>
    );
}
