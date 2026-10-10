import { useEffect, useMemo, useState } from "react";
import { useDateRange } from "../context/DateRangeContext";
import OutlierResultsTable from "../components/outliers/OutlierResultsTable";
import KpiCard from "../components/dashboard/KpiCard";
import { Gauge, Flag, Percent } from "lucide-react";
import {
    detectOutliers,
    type OutlierDefect,
    type OutlierMetric,
} from "../utils/outlierAnalytics";

const METRICS: {
    value: OutlierMetric;
    label: string;
}[] = [
    { value: "resolution", label: "Resolution Time" },
    { value: "vin", label: "Reports per VIN" },
    { value: "severity", label: "Critical Severity" },
];

export default function OutlierDetection() {
    const { dateRange } = useDateRange();

    const [defects, setDefects] = useState<OutlierDefect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [metric, setMetric] = useState<OutlierMetric>("resolution");
    const [multiplier, setMultiplier] = useState(1.5);
    const [severityThreshold, setSeverityThreshold] = useState(2);
    const [unresolvedOnly, setUnresolvedOnly] = useState(false);

    useEffect(() => {
        fetch("/data/defects.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load defect data");
                }

                return response.json();
            })
            .then((data: OutlierDefect[]) => setDefects(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // Filter by date only.
    // The unresolved checkbox must not change the detection baseline.
    const filteredDefects = useMemo(
        () =>
            defects.filter((defect) => {
                const date = defect["Report Date"]?.slice(0, 10);

                return (
                    date >= dateRange.start &&
                    date <= dateRange.end
                );
            }),
        [defects, dateRange.start, dateRange.end]
    );

    const result = useMemo(
        () =>
            detectOutliers(
                filteredDefects,
                metric,
                multiplier,
                unresolvedOnly,
                undefined,
                severityThreshold
            ),
        [
            filteredDefects,
            metric,
            multiplier,
            unresolvedOnly,
            severityThreshold,
        ]
    );

    if (loading) {
        return (
            <p className="text-gray-400">
                Loading outlier data...
            </p>
        );
    }

    if (error) {
        return <p className="text-red-400">{error}</p>;
    }

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Outlier Detection
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Identify unusual defect durations, repeated reports
                    per VIN, and critical-severity defects.
                </p>
            </div>

            {/* Detection settings */}
            <div className="grid gap-5 rounded-xl border border-white/10 bg-[#191a22] p-5 md:grid-cols-2">
                {/* Metric selector */}
                <div>
                    <label className="mb-2 block text-sm text-gray-400">
                        Metric
                    </label>

                    <select
                        value={metric}
                        onChange={(event) =>
                            setMetric(
                                event.target.value as OutlierMetric
                            )
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#252630] px-3 py-2 text-white"
                    >
                        {METRICS.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Adjustable threshold */}
                <div>
                    {metric === "severity" ? (
                        <>
                            <div className="mb-2 flex justify-between text-sm">
                                <label className="text-gray-400">
                                    Critical Severity Threshold
                                </label>

                                <span className="font-medium text-violet-400">
                                    ≤ {severityThreshold}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={severityThreshold}
                                onChange={(event) =>
                                    setSeverityThreshold(
                                        Number(event.target.value)
                                    )
                                }
                                className="w-full accent-violet-500"
                            />

                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                                <span>Most critical only</span>
                                <span>All severity ratings</span>
                            </div>
                        </>
                    ) : metric === "resolution" ? (
                        <>
                            <div className="mb-2 flex justify-between text-sm">
                                <label className="text-gray-400">
                                    IQR Multiplier
                                </label>

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
                                    setMultiplier(
                                        Number(event.target.value)
                                    )
                                }
                                className="w-full accent-violet-500"
                            />

                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                                <span>More sensitive</span>
                                <span>Less sensitive</span>
                            </div>
                        </>
                    ) : (
                        <p className="mt-7 text-sm text-gray-400">
                            VINs with more than one defect report are flagged automatically.
                        </p>
                    )}
                </div>

                {/* Unresolved-only display filter */}
                <div className="border-t border-white/10 pt-4 md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={unresolvedOnly}
                            onChange={(event) =>
                                setUnresolvedOnly(event.target.checked)
                            }
                            className="h-4 w-4 accent-violet-500"
                        />

                        <span className="text-sm text-white">
                            Unresolved reports only
                        </span>
                    </label>

                    <p className="mt-2 text-xs text-gray-400">
                        {metric === "vin"
                            ? "Show only flagged VINs with at least one unresolved report. The VIN threshold remains unchanged."
                            : "Show only flagged Open or In Progress reports. The detection threshold and total analyzed observations remain unchanged."}
                    </p>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid gap-5 md:grid-cols-3">
                <KpiCard
                    title={metric === "severity" ? "Critical Severity Threshold" : metric === "vin" ? "Repeat Report Rule" : "Outlier Threshold"}
                    value={result.threshold}
                    icon={Gauge}
                    description={metric === "severity" ? "Flag ratings ≤ this value (1 = most severe)" : metric === "vin" ? "Flag VINs with more than 1 report" : `Hours; Q3 + ${multiplier.toFixed(1)} × IQR`}
                />
                <KpiCard
                    title="Flagged Observations"
                    value={result.flaggedCount}
                    icon={Flag}
                    description={metric === "vin" ? "VINs flagged" : "Defect reports flagged"}
                />
                <KpiCard
                    title="Flagged Share"
                    value={Number(result.flaggedShare.toFixed(2))}
                    icon={Percent}
                    description="Percent of all valid observations"
                />
            </div>

            {/* Method explanation */}
            <p className="text-sm text-gray-400">
                {metric === "severity" ? (
                    <>
                        Reports with a severity rating of{" "}
                        <span className="text-white">
                            {severityThreshold} or lower
                        </span>{" "}
                        are flagged using an adjustable,
                        engineering-defined criticality rule.
                        Rating 1 is the most severe.
                    </>
                ) : metric === "vin" ? (
                    <>VINs with more than one defect report are flagged.</>
                ) : (
                    <>
                        An observation is flagged when its value
                        exceeds Q3 + {multiplier.toFixed(1)} × IQR.
                    </>
                )}

                {" "}Analyzed{" "}
                {result.total.toLocaleString()} valid{" "}
                {metric === "vin" ? "VINs" : "defect reports"}.
            </p>

            {/* Empty state */}
            {result.flaggedCount === 0 && (
                <div className="rounded-xl border border-white/10 bg-[#191a22] p-5 text-sm text-gray-400">
                    {metric === "severity"
                        ? "No reports meet the selected critical-severity threshold."
                        : "No outliers detected at the current sensitivity."}
                </div>
            )}

            {/* Flagged results */}
            <OutlierResultsTable
                flagged={result.flagged}
                metric={metric}
                threshold={result.threshold}
            />
        </div>
    );
}
