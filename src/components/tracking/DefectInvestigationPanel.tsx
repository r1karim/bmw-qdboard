import { useEffect, useState } from "react";
import { Flag, X } from "lucide-react";
import { useTracking, type InvestigationStatus } from "../../context/TrackingContext";
import AIInvestigation from "./AIInvestigation";
import type { DefectRow } from "../defects/tableConfig";

/**
 * Props for the defect investigation side panel.
 * A null defect indicates that the panel should not be displayed.
 */
type Props = { defect: DefectRow | null; onClose: () => void };

// Available workflow statuses for a defect investigation.
const STATUSES: InvestigationStatus[] = ["To Review", "Investigating", "Closed"];

/**
 * Displays a side panel for creating or editing a defect investigation.
 *
 * Allows engineers to review defect details, assign an investigation
 * status, write notes, and save or remove tracked investigations.
 * Also includes the AI investigation assistant for the selected defect.
 *
 * @param defect - Selected defect report, or null when the panel is closed.
 * @param onClose - Callback for closing the investigation panel.
 */
export default function DefectInvestigationPanel({ defect, onClose }: Props) {
    // Access saved investigations and tracking actions from the shared context.
    const { records, saveRecord, unflag } = useTracking();

    // Identify the selected defect and retrieve any existing investigation.
    const defectId = defect == null ? "" : String(defect["Defect ID"] ?? "");
    const record = records[defectId];

    // Local form state for the engineer's note and investigation status.
    const [note, setNote] = useState("");
    const [status, setStatus] = useState<InvestigationStatus>("To Review");

    // Populate the form with saved values when the selected investigation changes.
    useEffect(() => {
        setNote(record?.note ?? "");
        setStatus(record?.investigationStatus ?? "To Review");
    }, [defectId, record?.note, record?.investigationStatus]);

    // Allow the panel to be closed using the Escape key.
    useEffect(() => {
        if (!defect) return;
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [defect, onClose]);

    // Do not render the panel when no defect is selected.
    if (!defect) return null;

    return (
        // Full-screen overlay; clicking outside the panel closes it.
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <aside role="dialog" aria-modal="true" aria-label={`Investigation for ${defectId}`} className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#191a22] text-white shadow-2xl">
                {/* Panel header with the defect identifier, name, and close button. */}
                <div className="flex items-start justify-between border-b border-white/10 p-5">
                    <div>
                        <p className="text-xs text-violet-400">Quality investigation</p>
                        <h2 className="mt-1 text-base font-semibold">{defectId}</h2>
                        <p className="mt-1 text-xs text-zinc-400">{String(defect["Defect Name"] ?? "Unknown defect")}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close investigation panel" className="rounded p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
                </div>

                {/* Save the investigation and close the panel when the form is submitted. */}
                <form onSubmit={(event) => { event.preventDefault(); saveRecord(defectId, note, status); onClose(); }} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                    {/* Read-only information from the original defect report. */}
                    <div className="rounded-lg border border-white/10 bg-[#252631] p-3 text-xs text-zinc-300">
                        <p><span className="text-zinc-500">VIN:</span> {String(defect["VIN"] ?? "—")}</p>
                        <p className="mt-2"><span className="text-zinc-500">Resolution status:</span> {String(defect["Resolution Status"] ?? "—")}</p>
                        <p className="mt-2"><span className="text-zinc-500">Severity:</span> {String(defect["Severity Rating"] ?? "—")}</p>
                    </div>

                    {/* Select the current investigation workflow status. */}
                    <div>
                        <label htmlFor="investigation-status" className="mb-2 block text-xs font-medium text-zinc-300">Investigation status</label>
                        <select id="investigation-status" value={status} onChange={event => setStatus(event.target.value as InvestigationStatus)} className="w-full rounded-lg border border-white/10 bg-[#252631] px-3 py-2 text-sm text-white outline-none focus:border-violet-500">
                            {STATUSES.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>

                    {/* Editable notes for findings, observations, and next steps. */}
                    <div>
                        <label htmlFor="investigation-note" className="mb-2 block text-xs font-medium text-zinc-300">Engineer note</label>
                        <textarea id="investigation-note" value={note} onChange={event => setNote(event.target.value)} rows={7} placeholder="Describe the issue, findings, or next steps..." className="w-full resize-y rounded-lg border border-white/10 bg-[#252631] p-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-500" />
                    </div>

                    {/* Display the AI investigation assistant for the selected defect. */}
                    <AIInvestigation key={defectId} defect={defect} />

                    {/* Show the unflag action for existing records and the save button. */}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                        {record ? <button type="button" onClick={() => { if (window.confirm(`Remove ${defectId} from investigation tracking? Its note will also be deleted.`)) { unflag(defectId); onClose(); } }} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"><Flag size={14} /> Unflag defect</button> : <span className="text-xs text-zinc-500">Saving will flag this defect.</span>}
                        <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">Save investigation</button>
                    </div>
                </form>
            </aside>
        </div>
    );
}
