import { FILTERS, type FilterKey } from "../../hooks/useDefectFilters";

type Props = {
    options: Record<FilterKey, string[]>;
    selected: Record<FilterKey, string>;
    activeFilters: number;
    filteredCount: number;
    totalCount: number;
    onFilterChange: (key: FilterKey, value: string) => void;
    onClearAll: () => void;
};

export default function DefectFilters({
    options, selected, activeFilters, filteredCount, totalCount,
    onFilterChange, onClearAll,
}: Props) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">Filter Defects</h2>
                {activeFilters > 0 && (
                    <button type="button" onClick={onClearAll}
                        className="text-xs text-violet-400 transition-colors hover:text-violet-300">
                        Clear all filters
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {FILTERS.map(({ key, label }) => (
                    <div key={key}>
                        <label htmlFor={`filter-${key}`} className="mb-2 block text-xs text-zinc-400">
                            {label}
                        </label>
                        <select id={`filter-${key}`} value={selected[key]}
                            onChange={event => onFilterChange(key, event.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#252631] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                            <option value="">All {label}s</option>
                            {options[key].map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs text-zinc-500">
                Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} defect reports
            </p>
        </div>
    );
}
