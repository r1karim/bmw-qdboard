
import type { Defect, OutlierItem, OutlierMetric, OutlierResult } from "./types";

/**
 * Converts an unknown value into a valid non-negative number.
 *
 * Rejects null, undefined, empty strings, nonnumeric values,
 * negative numbers, and non-finite values such as Infinity or NaN.
 *
 * @param value - Value to validate and convert.
 * @returns A finite, non-negative number, or null if the value is invalid.
 */
export function getValidNumber(value: unknown): number | null {
    // Reject missing or explicitly empty values before numeric conversion.
    if (value === null || value === undefined || value === "") return null;

    // Convert the supplied value into a number.
    const number = Number(value);

    // Accept only finite values greater than or equal to zero.
    return Number.isFinite(number) && number >= 0 ? number : null;
}

/**
 * Determines whether a defect report is currently unresolved.
 *
 * Treats "open" and "in progress" as unresolved statuses.
 * Comparisons are case-insensitive and ignore surrounding whitespace.
 *
 * @param status - Resolution status associated with a defect report.
 * @returns True if the status is open or in progress; otherwise false.
 */
export function isUnresolved(status?: string): boolean {
    // Normalize the status to support consistent comparisons.
    const normalized = status?.trim().toLowerCase();

    // Recognize the two supported unresolved status values.
    return normalized === "open" || normalized === "in progress";
}

/**
 * Converts a defect report into a standardized outlier observation.
 *
 * Extracts the identifying information and metadata needed by
 * the outlier detection results table and related visualizations.
 *
 * The supplied numeric value represents the metric being analyzed,
 * such as severity rating, resolution duration, or VIN-related count.
 *
 * @param defect - Source defect report.
 * @param value - Numeric value associated with the selected outlier metric.
 * @returns A normalized OutlierItem containing the report identifier,
 *   metric value, report date, VIN, station, and resolution status.
 */
export function makeItem(defect: Defect, value: number): OutlierItem {
    return {
        // Use the defect identifier for both internal identification and display.
        id: String(defect["Defect ID"]),
        label: String(defect["Defect ID"]),

        // Store the numeric value used by the selected detection method.
        value,

        // Normalize the report date to its YYYY-MM-DD portion.
        date: defect["Report Date"]?.slice(0, 10) ?? "",

        // Preserve source metadata for investigation and result filtering.
        vin: defect.VIN,
        station: defect["Station Name"],
        status: defect["Resolution Status"],
    };
}

/**
 * Creates a standardized result object for an outlier detection analysis.
 *
 * Combines the selected metric, detection threshold, optional statistical
 * values, and flagged observations into a consistent result structure.
 *
 * The flagged share is calculated as:
 *
 *   (flagged observations / total valid observations) * 100
 *
 * An empty observation set produces a flagged share of zero
 * to avoid division by zero.
 *
 * @param metric - Outlier detection metric used in the analysis.
 * @param items - All valid observations included in the analysis.
 * @param flagged - Observations identified as outliers.
 * @param threshold - Threshold used to classify outliers.
 * @param q1 - First quartile, when applicable. Defaults to 0.
 * @param q3 - Third quartile, when applicable. Defaults to 0.
 * @param iqr - Interquartile range, when applicable. Defaults to 0.
 * @returns A standardized OutlierResult containing detection statistics
 *   and the flagged observations.
 */
export function makeResult(
    metric: OutlierMetric,
    items: OutlierItem[],
    flagged: OutlierItem[],
    threshold: number,
    q1 = 0,
    q3 = 0,
    iqr = 0
): OutlierResult {
    return {
        // Identify the metric and statistical values used for detection.
        metric,
        threshold,
        q1,
        q3,
        iqr,

        // Summarize the total number of valid observations and flagged items.
        total: items.length,
        flaggedCount: flagged.length,

        // Calculate the percentage of valid observations flagged as outliers.
        flaggedShare: items.length > 0 ? (flagged.length / items.length) * 100 : 0,

        // Preserve the flagged observations for display and investigation.
        flagged,
    };
}