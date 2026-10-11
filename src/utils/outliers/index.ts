import type { Defect } from "../dashboardAnalytics";
import type { OutlierMetric, OutlierResult} from "./types";
import { detectResolution } from "./resolution";
import { detectSeverity } from "./severity";
import { detectVin } from "./vin";

// Re-export the shared outlier types for use by other application modules.
export type {  OutlierItem, OutlierMetric, OutlierResult } from "./types";

/**
 * Detects defect outliers using the selected analysis metric.
 *
 * Acts as the central entry point for the outlier detection module,
 * delegating calculations to the appropriate metric-specific detector:
 * - Severity: identifies reports meeting the configured severity threshold.
 * - VIN: identifies vehicles with unusually high defect report counts.
 * - Resolution: identifies unusually long resolution times using an
 *   interquartile range (IQR) multiplier.
 *
 * Supports restricting results to unresolved defects and provides
 * additional parameters for resolution-time and severity analysis.
 *
 * @param filteredDefects - Defect reports included in the current analysis.
 * @param defects - Complete defect dataset used as context for resolution analysis.
 * @param metric - Outlier detection metric to apply.
 * @param multiplier - IQR multiplier for resolution-time detection. Defaults to 1.5.
 * @param unresolvedOnly - Whether to restrict results to unresolved defects. Defaults to false.
 * @param referenceDate - Reference timestamp for resolution analysis.
 *   Defaults to June 30, 2026, at 23:59:59 in local time.
 * @param severityThreshold - Severity threshold used by severity detection. Defaults to 2.
 * @returns Outlier detection results for the selected metric.
 */
export function detectOutliers(
    filteredDefects: Defect[],
    defects: Defect[],
    metric: OutlierMetric,
    multiplier = 1.5,
    unresolvedOnly = false,
    referenceDate = new Date(2026, 5, 30, 23, 59, 59),
    severityThreshold = 2
): OutlierResult {
    // Delegate detection to the appropriate metric-specific implementation.
    switch (metric) {
        case "severity":
            // Apply the configured severity threshold and unresolved-only filter.
            return detectSeverity(
                filteredDefects,
                severityThreshold,
                unresolvedOnly
            );
        case "vin":
            // Analyze defect report counts grouped by VIN.
            return detectVin(
                filteredDefects,
                unresolvedOnly
            );
        case "resolution":
            // Apply IQR-based resolution analysis with the supplied reference date.
            return detectResolution(
                filteredDefects,
                multiplier,
                unresolvedOnly,
                referenceDate,
                defects
            );
    }
}