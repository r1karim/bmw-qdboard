import type { OutlierMetric } from "../../utils/outliers";

/**
 * Props for the outlier detection controls.
 *
 * Receives the selected metric, detection parameters, and filtering
 * options along with callbacks for updating them in the parent component.
 */
type Props = {
    metric: OutlierMetric;
    setMetric: (metric: OutlierMetric) => void;
    multiplier: number;
    setMultiplier: (value: number) => void;
    severityThreshold: number;
    setSeverityThreshold: (value: number) => void;
    unresolvedOnly: boolean;
    setUnresolvedOnly: (value: boolean) => void;
};

// Available outlier detection metrics and their display labels.
const METRICS: { value: OutlierMetric; label: string }[] = [
    { value: "resolution", label: "Resolution Time" },
    { value: "vin", label: "Reports per VIN" },
    { value: "severity", label: "Critical Severity" },
];

/**
 * Displays configurable controls for outlier detection.
 *
 * Allows engineers to select an analysis metric, adjust the relevant
 * detection threshold, and optionally restrict displayed results
 * to unresolved defect reports.
 *
 * @param metric - Currently selected outlier detection metric.
 * @param setMetric - Callback for changing the selected metric.
 * @param multiplier - IQR multiplier for resolution time analysis.
 * @param setMultiplier - Callback for updating the IQR multiplier.
 * @param severityThreshold - Critical severity rating threshold.
 * @param setSeverityThreshold - Callback for updating the severity threshold.
 * @param unresolvedOnly - Whether to display only unresolved observations.
 * @param setUnresolvedOnly - Callback for toggling the unresolved filter.
 */
export default function OutlierControls({
                                            metric, setMetric, multiplier, setMultiplier,
                                            severityThreshold, setSeverityThreshold, unresolvedOnly, setUnresolvedOnly,
                                        }: Props) {
    return (
        <div className="grid gap-5 rounded-xl border border-white/10 bg-[#191a22] p-5 md:grid-cols-2">
            {/* Select the metric used for outlier detection. */}
            <div>
                <label className="mb-2 block text-sm text-gray-400">Metric</label>
                <select
                    value={metric}
                    onChange={(event) => setMetric(event.target.value as OutlierMetric)}
                    className="w-full rounded-lg border border-white/10 bg-[#252630] px-3 py-2 text-white"
                >
                    {METRICS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
            </div>

            {/* Display the threshold control associated with the selected metric. */}
            <div>
                {metric === "severity" ? (
                    <>
                        {/* Adjust the maximum severity rating considered critical. */}
                        <div className="mb-2 flex justify-between text-sm">
                            <label className="text-gray-400">Critical Severity Threshold</label>
                            <span className="font-medium text-violet-400">≤ {severityThreshold}</span>
                        </div>
                        <input
                            type="range" min="1" max="10" step="1"
                            value={severityThreshold}
                            onChange={(event) => setSeverityThreshold(Number(event.target.value))}
                            className="w-full accent-violet-500"
                        />
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>Most critical only</span><span>All severity ratings</span>
                        </div>
                    </>
                ) : metric === "resolution" ? (
                    <>
                        {/* Adjust the sensitivity of the IQR-based resolution time rule. */}
                        <div className="mb-2 flex justify-between text-sm">
                            <label className="text-gray-400">IQR Multiplier</label>
                            <span className="font-medium text-violet-400">{multiplier.toFixed(1)}×</span>
                        </div>
                        <input
                            type="range" min="0.5" max="3" step="0.5"
                            value={multiplier}
                            onChange={(event) => setMultiplier(Number(event.target.value))}
                            className="w-full accent-violet-500"
                        />
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>More sensitive</span><span>Less sensitive</span>
                        </div>
                    </>
                ) : (
                    // VIN analysis uses a fixed rule rather than an adjustable threshold.
                    <p className="mt-7 text-sm text-gray-400">
                        VINs with more than one defect report are flagged automatically.
                    </p>
                )}
            </div>

            {/* Optionally restrict displayed results to unresolved reports or VINs. */}
            <div className="border-t border-white/10 pt-4 md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox" checked={unresolvedOnly}
                        onChange={(event) => setUnresolvedOnly(event.target.checked)}
                        className="h-4 w-4 accent-violet-500"
                    />
                    <span className="text-sm text-white">Unresolved reports only</span>
                </label>
                {/* Explain how the unresolved filter affects the displayed results. */}
                <p className="mt-2 text-xs text-gray-400">
                    {metric === "vin"
                        ? "Show only flagged VINs with at least one unresolved report. The VIN threshold remains unchanged."
                        : "Show only flagged Open or In Progress reports. The detection threshold and total analyzed observations remain unchanged."}
                </p>
            </div>
        </div>
    );
}