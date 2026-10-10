import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "./tableConfig";

type Props = {
    rowCount: number;
    currentPage: number;
    totalPages: number;
    jumpPage: string;
    onJumpPageChange: (value: string) => void;
    onPageJump: () => void;
    onPageChange: (page: number) => void;
};

export default function DefectsPagination({
    rowCount, currentPage, totalPages, jumpPage,
    onJumpPageChange, onPageJump, onPageChange,
}: Props) {
    const target = Number(jumpPage);
    const invalidJump = jumpPage.trim() === "" || !Number.isInteger(target) || target < 1 || target > totalPages;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 p-4">
            <div className="text-xs text-zinc-500">
                {rowCount > 0
                    ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, rowCount)} of ${rowCount.toLocaleString()}`
                    : "Showing 0 reports"}
                <span className="ml-3 text-zinc-400">Page {currentPage} of {totalPages}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onPageJump();
                    }}
                    className="flex items-center gap-2"
                >
                    <label htmlFor="jump-page" className="text-xs text-zinc-400">Go to</label>
                    <input
                        id="jump-page"
                        type="number"
                        min={1}
                        max={totalPages}
                        step={1}
                        value={jumpPage}
                        onChange={(event) => onJumpPageChange(event.target.value)}
                        placeholder="#"
                        className="w-16 rounded-lg border border-white/10 bg-[#252631] px-2 py-2 text-center text-xs text-white outline-none focus:border-violet-500"
                    />
                    <button
                        type="submit"
                        disabled={invalidJump}
                        className="rounded-lg bg-violet-600 px-3 py-2 text-xs text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >Go</button>
                </form>
                <div className="h-5 w-px bg-white/10" />
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronLeft size={14} />Previous
                </button>
                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    Next<ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
