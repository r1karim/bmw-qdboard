import { useState } from "react";
import DefectsTableHeader from "./DefectsTableHeader";
import DefectsTableBody from "./DefectsTableBody";
import DefectsPagination from "./DefectsPagination";
import DefectInvestigationPanel from "../tracking/DefectInvestigationPanel";
import { useDefectsTable } from "./useDefectsTable";
import type { DefectRow } from "./tableConfig";

export type { DefectRow } from "./tableConfig";

export default function DefectsTable({ defects }: { defects: DefectRow[] }) {
    const table = useDefectsTable(defects);
    const [selectedDefect, setSelectedDefect] = useState<DefectRow | null>(null);

    return (
        <>
            <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#191a22]">
                <DefectsTableHeader search={table.search} onSearch={table.handleSearch} matchedCount={table.rows.length} totalCount={defects.length} />
                <DefectsTableBody visibleRows={table.visibleRows} sortColumn={table.sortColumn} sortDirection={table.sortDirection} onSort={table.handleSort} onOpenInvestigation={setSelectedDefect} />
                <DefectsPagination rowCount={table.rows.length} currentPage={table.currentPage} totalPages={table.totalPages} jumpPage={table.jumpPage} onJumpPageChange={table.setJumpPage} onPageJump={table.handlePageJump} onPageChange={table.setPage} />
            </div>
            <DefectInvestigationPanel defect={selectedDefect} onClose={() => setSelectedDefect(null)} />
        </>
    );
}