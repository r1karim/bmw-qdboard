import { Gauge, Flag, Percent } from "lucide-react";
import KpiCard from "../dashboard/KpiCard";
import type { OutlierMetric, OutlierResult } from "../../utils/outliers";

/**
 * Props for the outlier analysis summary.
 *
 * The selected metric determines how thresholds, flagged observations,
 * and explanatory descriptions are presented.
 */
type Props = {
    metric: OutlierMetric;
    result: OutlierResult;
    multiplier: number;
    severityThreshold: number;
};


/**
 * Displays KPI cards and an explanation of the selected outlier analysis.
 *
 * Summarizes the detection threshold, number of flagged observations,
 * and percentage of valid observations flagged.
 *
 * Supports resolution time, repeated VIN reports, and severity analysis.
 *
 * @param metric - Selected outlier detection metric.
 * @param result - Calculated outlier detection results.
 * @param multiplier - IQR multiplier used for resolution time detection.
 * @param severityThreshold - Maximum severity rating considered critical.
 */
export default function OutlierSummary({ metric, result, multiplier, severityThreshold }: Props) {
    return (
        <>
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
            <p className="text-sm text-gray-400">
                {metric === "severity" ? (
                    <>
                        Reports with a severity rating of{" "}
                        <span className="text-white">{severityThreshold} or lower</span>{" "}
                        are flagged using an adjustable, engineering-defined criticality rule.
                        Rating 1 is the most severe.
                    </>
                ) : metric === "vin" ? (
                    <>VINs with more than one defect report are flagged.</>
                ) : (
                    <>An observation is flagged when its value exceeds Q3 + {multiplier.toFixed(1)} × IQR.</>
                )}
                {" "}Analyzed {result.total.toLocaleString()} valid{" "}
                {metric === "vin" ? "VINs" : "defect reports"}.
            </p>
        </>
    );
}
