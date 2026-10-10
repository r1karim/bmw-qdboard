import { useMemo, useState } from "react";
import { COLUMNS, PAGE_SIZE, type DefectRow, type SortDirection } from "./tableConfig";

export function useDefectsTable(defects: DefectRow[]) {
    const [search, setSearch] = useState("");
    const [sortColumn, setSortColumn] = useState<string>("Report Date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [page, setPage] = useState(1);
    const [jumpPage, setJumpPage] = useState("");

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        return defects
            .filter((defect) =>
                COLUMNS.some((column) =>
                    String(defect[column] ?? "").toLowerCase().includes(query)
                )
            )
            .sort((a, b) => {
                const left = a[sortColumn];
                const right = b[sortColumn];
                if (left == null && right == null) return 0;
                if (left == null || left === "") return 1;
                if (right == null || right === "") return -1;
                const comparison = typeof left === "number" && typeof right === "number"
                    ? left - right
                    : String(left).localeCompare(String(right), undefined, { numeric: true });
                return sortDirection === "asc" ? comparison : -comparison;
            });
    }, [defects, search, sortColumn, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibleRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSort(column: string) {
        if (sortColumn === column) {
            setSortDirection((previous) => previous === "asc" ? "desc" : "asc");
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
        if (!Number.isInteger(target) || target < 1 || target > totalPages) return;
        setPage(target);
        setJumpPage("");
    }

    return {
        search, sortColumn, sortDirection, rows, totalPages, currentPage,
        visibleRows, jumpPage, setJumpPage, setPage,
        handleSort, handleSearch, handlePageJump,
    };
}
