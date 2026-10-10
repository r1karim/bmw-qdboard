import { ArrowDown, ArrowUp, ArrowUpDown, Flag, MessageSquareText } from "lucide-react";
import { useTracking } from "../../context/TrackingContext";
import { COLUMNS, type DefectRow, type SortDirection } from "./tableConfig";

type Props = {
    visibleRows: DefectRow[];
    sortColumn: string;
    sortDirection: SortDirection;
    onSort: (column: string) => void;
    onOpenInvestigation: (defect: DefectRow) => void;
};

export default function DefectsTableBody({ visibleRows, sortColumn, sortDirection, onSort, onOpenInvestigation }: Props) {
    const { records } = useTracking();
    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-max whitespace-nowrap text-left text-xs">
                <thead className="bg-[#20212b]">
                    <tr>
                        <th className="sticky left-0 z-10 bg-[#20212b] px-4 py-3 text-zinc-400">Flag</th>
                        <th className="px-4 py-3 text-zinc-400">Engineer Note</th>
                        {COLUMNS.map(column => (
                            <th key={column} className="px-4 py-3 text-zinc-400">
                                <button type="button" onClick={() => onSort(column)} className="flex items-center gap-2 font-medium transition-colors hover:text-white">
                                    {column}
                                    {sortColumn !== column ? <ArrowUpDown size={12} /> : sortDirection === "asc" ? <ArrowUp size={12} className="text-violet-400" /> : <ArrowDown size={12} className="text-violet-400" />}
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map((defect, index) => {
                        const defectId = String(defect["Defect ID"] ?? "");
                        const record = records[defectId];
                        return (
                            <tr key={`${defectId}-${index}`} className="border-t border-white/5 transition-colors hover:bg-white/5">
                                <td className="sticky left-0 bg-[#191a22] px-4 py-3 group-hover:bg-[#252631]">
                                    <button type="button" onClick={() => onOpenInvestigation(defect)} aria-label={`${record ? "Edit flagged" : "Flag"} defect ${defectId}`} title={record ? `Flagged: ${record.investigationStatus}` : "Flag defect"} className={record ? "text-violet-400 hover:text-violet-300" : "text-zinc-500 hover:text-violet-400"}>
                                        <Flag size={16} fill={record ? "currentColor" : "none"} />
                                    </button>
                                </td>
                                <td className="max-w-64 px-4 py-3">
                                    <button type="button" onClick={() => onOpenInvestigation(defect)} className="flex max-w-64 items-center gap-2 text-left text-zinc-300 hover:text-violet-300" title={record?.note || "Add engineer note"}>
                                        <MessageSquareText size={14} className="shrink-0" />
                                        <span className="truncate">{record?.note || (record ? "Edit note" : "+ Add note")}</span>
                                    </button>
                                </td>
                                {COLUMNS.map(column => (
                                    <td key={column} className="px-4 py-3 text-zinc-300">
                                        {defect[column] == null || defect[column] === "" ? "—" : String(defect[column])}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {visibleRows.length === 0 && <div className="p-12 text-center text-sm text-zinc-500">No matching defect reports found.</div>}
        </div>
    );
}
