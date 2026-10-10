import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { COLUMNS, type DefectRow, type SortDirection } from "./tableConfig";

type Props = {
    visibleRows: DefectRow[];
    sortColumn: string;
    sortDirection: SortDirection;
    onSort: (column: string) => void;
};

export default function DefectsTableBody({ visibleRows, sortColumn, sortDirection, onSort }: Props) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-max whitespace-nowrap text-left text-xs">
                <thead className="bg-[#20212b]">
                    <tr>
                        {COLUMNS.map((column) => (
                            <th key={column} className="px-4 py-3 text-zinc-400">
                                <button
                                    type="button"
                                    onClick={() => onSort(column)}
                                    className="flex items-center gap-2 font-medium transition-colors hover:text-white"
                                >
                                    {column}
                                    {sortColumn !== column ? (
                                        <ArrowUpDown size={12} />
                                    ) : sortDirection === "asc" ? (
                                        <ArrowUp size={12} className="text-violet-400" />
                                    ) : (
                                        <ArrowDown size={12} className="text-violet-400" />
                                    )}
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map((defect, index) => (
                        <tr
                            key={`${defect["Defect ID"]}-${index}`}
                            className="border-t border-white/5 transition-colors hover:bg-white/5"
                        >
                            {COLUMNS.map((column) => (
                                <td key={column} className="px-4 py-3 text-zinc-300">
                                    {defect[column] == null || defect[column] === ""
                                        ? "—"
                                        : String(defect[column])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {visibleRows.length === 0 && (
                <div className="p-12 text-center text-sm text-zinc-500">
                    No matching defect reports found.
                </div>
            )}
        </div>
    );
}
