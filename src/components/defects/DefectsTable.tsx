
import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export type DefectRow = Record<string, string | number | null>;

const COLUMNS = [
    "Defect ID",
    "Report Date",
    "Report Time",
    "Production Date",
    "VIN",
    "Car Model",
    "Motor Type",
    "Design Package",
    "Station ID",
    "Station Name",
    "Part Number",
    "Part Name",
    "Supplier",
    "Defect Name",
    "Defect Category",
    "Severity Rating",
    "Inspector ID",
    "Production Shift",
    "Resolution Status",
    "Resolution Timestamp",
    "Resolution Time (hours)",
    "Root Cause Identified",
    "Rework Time (minutes)",
] as const;

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 25;

export default function DefectsTable({
                                         defects,
                                     }: {
    defects: DefectRow[];
}) {
    const [search, setSearch] = useState("");
    const [sortColumn, setSortColumn] = useState<string>("Report Date");
    const [sortDirection, setSortDirection] =
        useState<SortDirection>("desc");

    const [page, setPage] = useState(1);
    const [jumpPage, setJumpPage] = useState("");

    // Search across all 23 columns, then sort the matching rows.
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return defects
            .filter((defect) =>
                COLUMNS.some((column) =>
                    String(defect[column] ?? "")
                        .toLowerCase()
                        .includes(query)
                )
            )
            .sort((a, b) => {
                const left = a[sortColumn];
                const right = b[sortColumn];

                // Keep missing values at the end.
                if (left == null && right == null) return 0;
                if (left == null || left === "") return 1;
                if (right == null || right === "") return -1;

                let comparison: number;

                if (
                    typeof left === "number" &&
                    typeof right === "number"
                ) {
                    comparison = left - right;
                } else {
                    comparison = String(left).localeCompare(
                        String(right),
                        undefined,
                        { numeric: true }
                    );
                }

                return sortDirection === "asc"
                    ? comparison
                    : -comparison;
            });
    }, [defects, search, sortColumn, sortDirection]);

    const totalPages = Math.max(
        1,
        Math.ceil(rows.length / PAGE_SIZE)
    );

    const currentPage = Math.min(page, totalPages);

    const visibleRows = rows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    function handleSort(column: string) {
        if (sortColumn === column) {
            setSortDirection((previous) =>
                previous === "asc" ? "desc" : "asc"
            );
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }

        setPage(1);
        setJumpPage("");
    }

    function handleSearch(value: string) {
        setSearch(value);
        setPage(1);
        setJumpPage("");
    }

    function handlePageJump() {
        const target = Number(jumpPage);

        if (
            !Number.isInteger(target) ||
            target < 1 ||
            target > totalPages
        ) {
            return;
        }

        setPage(target);
        setJumpPage("");
    }

    return (
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">

            {/* Header and search */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        Defect Records
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                        {rows.length.toLocaleString()} of{" "}
                        {defects.length.toLocaleString()} reports
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#252631] px-3 py-2">
                    <Search size={15} className="text-zinc-500" />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            handleSearch(event.target.value)
                        }
                        placeholder="Search all columns..."
                        aria-label="Search defect records"
                        className="w-64 max-w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-500"
                    />
                </div>
            </div>

            {/* Scrollable table */}
            <div className="w-full overflow-x-auto">
                <table className="min-w-max whitespace-nowrap text-left text-xs">

                    <thead className="bg-[#20212b]">
                    <tr>
                        {COLUMNS.map((column) => (
                            <th
                                key={column}
                                className="px-4 py-3 text-zinc-400"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleSort(column)}
                                    className="flex items-center gap-2 font-medium transition-colors hover:text-white"
                                >
                                    {column}

                                    {sortColumn !== column ? (
                                        <ArrowUpDown size={12} />
                                    ) : sortDirection === "asc" ? (
                                        <ArrowUp
                                            size={12}
                                            className="text-violet-400"
                                        />
                                    ) : (
                                        <ArrowDown
                                            size={12}
                                            className="text-violet-400"
                                        />
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
                                <td
                                    key={column}
                                    className="px-4 py-3 text-zinc-300"
                                >
                                    {defect[column] == null ||
                                    defect[column] === ""
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

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 p-4">

                <div className="text-xs text-zinc-500">
                    {rows.length > 0
                        ? `Showing ${
                            (currentPage - 1) * PAGE_SIZE + 1
                        }–${Math.min(
                            currentPage * PAGE_SIZE,
                            rows.length
                        )} of ${rows.length.toLocaleString()}`
                        : "Showing 0 reports"}

                    <span className="ml-3 text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                    {/* Jump to page */}
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            handlePageJump();
                        }}
                        className="flex items-center gap-2"
                    >
                        <label
                            htmlFor="jump-page"
                            className="text-xs text-zinc-400"
                        >
                            Go to
                        </label>

                        <input
                            id="jump-page"
                            type="number"
                            min={1}
                            max={totalPages}
                            step={1}
                            value={jumpPage}
                            onChange={(event) =>
                                setJumpPage(event.target.value)
                            }
                            placeholder="#"
                            className="w-16 rounded-lg border border-white/10 bg-[#252631] px-2 py-2 text-center text-xs text-white outline-none focus:border-violet-500"
                        />

                        <button
                            type="submit"
                            disabled={
                                jumpPage.trim() === "" ||
                                !Number.isInteger(Number(jumpPage)) ||
                                Number(jumpPage) < 1 ||
                                Number(jumpPage) > totalPages
                            }
                            className="rounded-lg bg-violet-600 px-3 py-2 text-xs text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Go
                        </button>
                    </form>

                    <div className="h-5 w-px bg-white/10" />

                    {/* Previous */}
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                            setPage(Math.max(1, currentPage - 1))
                        }
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </button>

                    {/* Next */}
                    <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setPage(Math.min(totalPages, currentPage + 1))
                        }
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Next
                        <ChevronRight size={14} />
                    </button>

                </div>
            </div>
        </div>
    );
}
