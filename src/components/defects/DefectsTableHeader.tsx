import { Search } from "lucide-react";

type Props = {
    search: string;
    onSearch: (value: string) => void;
    matchedCount: number;
    totalCount: number;
};

export default function DefectsTableHeader({ search, onSearch, matchedCount, totalCount }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
            <div>
                <h2 className="text-sm font-semibold text-white">Defect Records</h2>
                <p className="mt-1 text-xs text-zinc-500">
                    {matchedCount.toLocaleString()} of {totalCount.toLocaleString()} reports
                </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#252631] px-3 py-2">
                <Search size={15} className="text-zinc-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder="Search all columns..."
                    aria-label="Search defect records"
                    className="w-64 max-w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-500"
                />
            </div>
        </div>
    );
}
