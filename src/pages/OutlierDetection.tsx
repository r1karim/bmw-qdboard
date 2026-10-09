import { useEffect, useMemo, useState } from "react";
import { useDateRange } from "../context/DateRangeContext";
import OutlierResultsTable from "../components/outliers/OutlierResultsTable";
import {
    detectOutliers,
    type OutlierDefect,
    type OutlierMetric,
} from "../utils/outlierAnalytics";

const METRICS: { value: OutlierMetric; label: string; unit: string }[] = [
    { value: "resolution", label: "Resolution Time", unit: "hours" },
    { value: "rework", label: "Rework Time", unit: "minutes" },
    { value: "daily", label: "Daily Defect Reports", unit: "reports/day" },
];

export default function OutlierDetection() {
    const { dateRange } = useDateRange();

    const [defects, setDefects] = useState<OutlierDefect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [metric, setMetric] = useState<OutlierMetric>("resolution");
    const [multiplier, setMultiplier] = useState(1.5);
    const [unresolvedOnly, setUnresolvedOnly] = useState(false);

    useEffect(() => {
        fetch("/data/defects.json")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load defect data");
                return response.json();
            })
            .then((data: OutlierDefect[]) => setDefects(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filteredDefects = useMemo(
        () =>
            defects.filter((defect) => {
                const date = defect["Report Date"]?.slice(0, 10);

                const matchesDate =
                    date >= dateRange.start && date <= dateRange.end;

                const matchesStatus =
                    !unresolvedOnly ||
                    defect["Resolution Status"]?.trim().toLowerCase() === "unresolved";

                return matchesDate && matchesStatus;
            }),
        [defects, dateRange.start, dateRange.end, unresolvedOnly]
    );

    const result = useMemo(
        () =>
            detectOutliers(
                filteredDefects,
                metric,
                multiplier,
                dateRange.start,
                dateRange.end
            ),
        [filteredDefects, metric, multiplier, dateRange]
    );

    const selectedMetric = METRICS.find((item) => item.value === metric)!;

    if (loading) return <p className="text-gray-400">Loading outlier data...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Outlier Detection
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Identify unusually high defect durations and report volumes using
                    data-driven thresholds.
                </p>
            </div>

            {/* Detection settings */}
            <div className="grid gap-5 rounded-xl border border-white/10 bg-[#191a22] p-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm text-gray-400">
                        Metric
                    </label>
                    <select
                        value={metric}
                        onChange={(event) =>
                            setMetric(event.target.value as OutlierMetric)
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#252630] px-3 py-2 text-white"
                    >
                        {METRICS.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="mb-2 flex justify-between text-sm">
                        <label className="text-gray-400">IQR Multiplier</label>
                        <span className="font-medium text-violet-400">
              {multiplier.toFixed(1)}×
            </span>
                    </div>

                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={multiplier}
                        onChange={(event) =>
                            setMultiplier(Number(event.target.value))
                        }
                        className="w-full accent-violet-500"
                    />

                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>More sensitive</span>
                        <span>Less sensitive</span>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 border-t border-white/10 pt-4">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={unresolvedOnly}
                        onChange={(event) => setUnresolvedOnly(event.target.checked)}
                        className="h-4 w-4 accent-violet-500"
                    />
                    <span className="text-sm text-white">
                      Unresolved reports only
                    </span>
                </label>

                <p className="mt-2 text-xs text-gray-400">
                    When unchecked, both resolved and unresolved reports are included.
                </p>
            </div>

            {/* KPI cards */}
            <div className="grid gap-5 md:grid-cols-3">
                <KpiCard
                    title="Outlier Threshold"
                    value={`${result.threshold.toFixed(2)} ${selectedMetric.unit}`}
                />
                <KpiCard
                    title="Flagged Observations"
                    value={result.flaggedCount.toLocaleString()}
                />
                <KpiCard
                    title="Flagged Share"
                    value={`${result.flaggedShare.toFixed(2)}%`}
                />
            </div>

            <p className="text-sm text-gray-400">
                An observation is flagged when its value exceeds Q3 +{" "}
                {multiplier.toFixed(1)} × IQR. Analyzed{" "}
                {result.total.toLocaleString()} valid{" "}
                {metric === "daily" ? "days" : "defect reports"}.
            </p>

            {result.flaggedCount === 0 && (
                <div className="rounded-xl border border-white/10 bg-[#191a22] p-5 text-sm text-gray-400">
                    No outliers detected at the current sensitivity.
                </div>
            )}

            <OutlierResultsTable
                flagged={result.flagged}
                metric={metric}
                threshold={result.threshold}
            />
        </div>
    );
}

function KpiCard({
                     title,
                     value,
                 }: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        </div>
    );
}