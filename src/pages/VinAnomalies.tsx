import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useDefects } from "../context/DefectsContext";
import { detectVinAnomalies } from "../utils/vinAnomalies";

export default function VinAnomalies() {
    const { defects, loading, error } = useDefects();
    const [search, setSearch] = useState("");
    const [expandedVin, setExpandedVin] = useState<string | null>(null);

    const anomalies = useMemo(
        () => detectVinAnomalies(defects),
        [defects]
    );

    const filtered = useMemo(
        () =>
            anomalies.filter(item =>
                item.vin.toLowerCase().includes(search.toLowerCase().trim())
            ),
        [anomalies, search]
    );

    const affectedReports = useMemo(
        () => anomalies.reduce((sum, item) => sum + item.reportCount, 0),
        [anomalies]
    );

    if (loading) {
        return <p className="p-6 text-zinc-400">Loading VIN anomalies...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-400">{error}</p>;
    }

    return (
        <div className="space-y-6 p-6 text-white">
            <div>
                <h1 className="text-2xl font-semibold">VIN Anomalies</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Detect inconsistent vehicle attributes across defect reports.
                    These anomalies require verification against trusted vehicle records.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Anomalous VINs"
                    value={anomalies.length}
                />
                <SummaryCard
                    label="Affected Reports"
                    value={affectedReports}
                />
                <SummaryCard
                    label="Attributes Checked"
                    value={3}
                />
            </div>

            <div className="rounded-xl border border-white/10 bg-[#191a22]">
                <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-semibold">
                        Inconsistent Vehicle Records
                    </h2>

                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search VIN..."
                            className="w-full rounded-lg border border-white/10 bg-[#252631] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 sm:w-60"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p className="p-6 text-sm text-zinc-400">
                        No VIN anomalies found.
                    </p>
                ) : (
                    <div className="divide-y divide-white/10">
                        {filtered.map(item => (
                            <div key={item.vin}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpandedVin(
                                            expandedVin === item.vin
                                                ? null
                                                : item.vin
                                        )
                                    }
                                    className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-white/5"
                                >
                                    <AlertTriangle
                                        size={17}
                                        className="shrink-0 text-amber-400"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {item.vin}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            {item.conflictingFields.join(", ")}
                                        </p>
                                    </div>

                                    <span className="text-xs text-zinc-400">
                                        {item.reportCount} reports
                                    </span>

                                    {expandedVin === item.vin ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </button>

                                {expandedVin === item.vin && (
                                    <div className="space-y-4 border-t border-white/10 bg-[#20212b] p-4">
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-semibold text-zinc-300">
                                                Conflicting values
                                            </h3>

                                            {item.conflictingFields.map(field => (
                                                <p key={field} className="text-sm">
                                                    <span className="text-zinc-400">
                                                        {field}:
                                                    </span>{" "}
                                                    <span className="text-amber-300">
                                                        {item.values[field].join(" / ")}
                                                    </span>
                                                </p>
                                            ))}
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead className="border-b border-white/10 text-zinc-400">
                                                <tr>
                                                    <th className="px-3 py-2">Defect ID</th>
                                                    <th className="px-3 py-2">Car Model</th>
                                                    <th className="px-3 py-2">Motor Type</th>
                                                    <th className="px-3 py-2">Design Package</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {item.reports.map((report, index) => (
                                                    <tr
                                                        key={`${String(report["Defect ID"])}-${index}`}
                                                        className="border-b border-white/5"
                                                    >
                                                        <td className="px-3 py-2">
                                                            {String(report["Defect ID"] ?? "—")}
                                                        </td>
                                                        <td className={`px-3 py-2 ${item.conflictingFields.includes("Car Model") ? "text-amber-300" : ""}`}>
                                                            {String(report["Car Model"] ?? "—")}
                                                        </td>
                                                        <td className={`px-3 py-2 ${item.conflictingFields.includes("Motor Type") ? "text-amber-300" : ""}`}>
                                                            {String(report["Motor Type"] ?? "—")}
                                                        </td>
                                                        <td className={`px-3 py-2 ${item.conflictingFields.includes("Design Package") ? "text-amber-300" : ""}`}>
                                                            {String(report["Design Package"] ?? "—")}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs text-zinc-500">
                                            Conflicting records are highlighted.
                                            The correct values cannot be determined
                                            from defect reports alone.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({
                         label,
                         value,
                     }: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-4">
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold">
                {value.toLocaleString()}
            </p>
        </div>
    );
}