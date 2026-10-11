import { useMemo, useState } from "react";
import OutlierControls from "../components/outliers/OutlierControls";
import OutlierSummary from "../components/outliers/OutlierSummary";
import OutlierResultsTable from "../components/outliers/OutlierResultsTable";
import useOutlierData from "../hooks/useOutlierData";
import { detectOutliers, type OutlierMetric } from "../utils/outliers";

/**
 * Outlier Detection page for identifying unusual production quality records.
 *
 * Supports three analysis modes:
 * - Resolution: unusually long defect resolution times.
 * - VIN: vehicles associated with repeated defect reports.
 * - Severity: defects meeting a critical-severity threshold.
 *
 * Detection results update when the selected metric or its settings change.
 */
export default function OutlierDetection() {
    // Retrieve the complete dataset and records within the selected date range.
    const { defects, filteredDefects, loading, error } = useOutlierData();

    // Selected outlier metric. Resolution time is the default analysis.
    const [metric, setMetric] = useState<OutlierMetric>("resolution");

    // IQR multiplier controlling the sensitivity of resolution-time detection.
    // A smaller multiplier generally flags more observations.
    const [multiplier, setMultiplier] = useState(1.5);

    // Severity ratings at or below this value are considered critical.
    // In this dataset, 1 represents the highest severity.
    const [severityThreshold, setSeverityThreshold] = useState(2);

    // Optionally restrict the analysis to unresolved defect reports.
    const [unresolvedOnly, setUnresolvedOnly] = useState(false);

    // Recalculate outliers when the dataset, date range, or settings change.
    // useMemo avoids repeating the calculation on unrelated renders.
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

    // Handle loading and data retrieval errors before rendering the page.
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

            {/* Controls for choosing the metric and adjusting detection settings. */}
            <OutlierControls
                metric={metric} setMetric={setMetric}
                multiplier={multiplier} setMultiplier={setMultiplier}
                severityThreshold={severityThreshold} setSeverityThreshold={setSeverityThreshold}
                unresolvedOnly={unresolvedOnly} setUnresolvedOnly={setUnresolvedOnly}
            />

            {/* Summary of the current detection results and threshold. */}
            <OutlierSummary
                metric={metric} result={result}
                multiplier={multiplier} severityThreshold={severityThreshold}
            />

            {/* Explain when no observations meet the selected criteria. */}
            {result.flaggedCount === 0 && (
                <div className="rounded-xl border border-white/10 bg-[#191a22] p-5 text-sm text-gray-400">
                    {metric === "severity"
                        ? "No reports meet the selected critical-severity threshold."
                        : "No outliers detected at the current sensitivity."}
                </div>
            )}

            {/* Display flagged observations in the interactive results table.
                Pass the filtered defects for accessing their original reports. */}
            <OutlierResultsTable
                flagged={result.flagged}
                metric={metric}
                threshold={result.threshold}
                defects={filteredDefects}
            />
        </div>
    );
}
