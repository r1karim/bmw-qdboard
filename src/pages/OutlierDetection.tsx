import { useMemo, useState } from "react";
import OutlierControls from "../components/outliers/OutlierControls";
import OutlierSummary from "../components/outliers/OutlierSummary";
import OutlierResultsTable from "../components/outliers/OutlierResultsTable";
import useOutlierData from "../hooks/useOutlierData";
import { detectOutliers, type OutlierMetric } from "../utils/outlierAnalytics";

export default function OutlierDetection() {
    const { defects, filteredDefects, loading, error } = useOutlierData();    const [metric, setMetric] = useState<OutlierMetric>("resolution");
    const [multiplier, setMultiplier] = useState(1.5);
    const [severityThreshold, setSeverityThreshold] = useState(2);
    const [unresolvedOnly, setUnresolvedOnly] = useState(false);

    const result = useMemo(
        () =>
            detectOutliers(
                filteredDefects,
                defects,
                metric,
                multiplier,
                unresolvedOnly,
                undefined,
                severityThreshold
            ),
        [
            filteredDefects,
            defects,
            metric,
            multiplier,
            unresolvedOnly,
            severityThreshold,
        ]
    );

    if (loading) return <p className="text-gray-400">Loading outlier data...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">Outlier Detection</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Identify unusual defect durations, repeated reports per VIN, and critical-severity defects.
                </p>
            </div>

            <OutlierControls
                metric={metric} setMetric={setMetric}
                multiplier={multiplier} setMultiplier={setMultiplier}
                severityThreshold={severityThreshold} setSeverityThreshold={setSeverityThreshold}
                unresolvedOnly={unresolvedOnly} setUnresolvedOnly={setUnresolvedOnly}
            />

            <OutlierSummary
                metric={metric} result={result}
                multiplier={multiplier} severityThreshold={severityThreshold}
            />

            {result.flaggedCount === 0 && (
                <div className="rounded-xl border border-white/10 bg-[#191a22] p-5 text-sm text-gray-400">
                    {metric === "severity"
                        ? "No reports meet the selected critical-severity threshold."
                        : "No outliers detected at the current sensitivity."}
                </div>
            )}

            <OutlierResultsTable
                flagged={result.flagged}
                metric={metric}
                threshold={result.threshold}
                defects={filteredDefects}
            />
        </div>
    );
}
