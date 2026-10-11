import type { Defect, OutlierItem, OutlierResult } from "./types";
import { getValidNumber, isUnresolved, makeItem, makeResult } from "./shared";

/**
 * Calculates a quantile from a numerically sorted dataset.
 *
 * Uses linear interpolation between adjacent values when the requested
 * quantile falls between two array indices.
 *
 * The input array must already be sorted in ascending order.
 *
 * @param sorted - Numeric values sorted in ascending order.
 * @param p - Quantile position, typically between 0 and 1.
 * @returns The interpolated quantile value, or 0 for an empty dataset.
 */
function quantile(sorted: number[], p: number): number {
    // Return a neutral value when no observations are available.
    if (sorted.length === 0) return 0;

    // Determine the fractional index corresponding to the quantile.
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    // Return the exact observation when interpolation is unnecessary.
    if (lower === upper) return sorted[lower];

    // Interpolate between the two surrounding observations.
    return sorted[lower] +
        (sorted[upper] - sorted[lower]) * (index - lower);
}

/**
 * Converts defect reports into resolution-duration observations.
 *
 * For resolved reports, the duration comes from the recorded
 * "Resolution Time (hours)" field.
 *
 * For unresolved reports, the duration represents the elapsed time
 * between the report timestamp and the supplied reference date.
 *
 * Reports with unsupported resolution statuses, invalid timestamps,
 * missing numeric durations, or negative unresolved durations are excluded.
 *
 * @param defects - Defect reports to process.
 * @param referenceDate - Timestamp used to calculate unresolved report age.
 * @returns Valid resolution-duration observations as OutlierItem objects.
 */
function getDurationItems(defects: Defect[], referenceDate: Date): OutlierItem[] {
    return defects.flatMap((defect) => {
        // Normalize the resolution status for consistent comparisons.
        const status = defect["Resolution Status"]?.trim().toLowerCase();
        let value: number | null = null;

        if (status === "resolved") {
            // Use the recorded resolution time for completed reports.
            value = getValidNumber(defect["Resolution Time (hours)"]);
        } else if (isUnresolved(status)) {
            // Combine the report date and time into a timestamp.
            // Default to midnight when the report time is missing.
            const reportDate = defect["Report Date"]?.slice(0, 10);
            const reportTime = defect["Report Time"] || "00:00:00";
            const reportedAt = new Date(`${reportDate}T${reportTime}`);

            // Exclude reports whose timestamps cannot be parsed.
            if (Number.isNaN(reportedAt.getTime())) return [];

            // Calculate the unresolved report's age in hours.
            value = (referenceDate.getTime() - reportedAt.getTime()) /
                (1000 * 60 * 60);

            // Exclude reports dated after the reference timestamp.
            if (value < 0) return [];
        } else {
            // Ignore reports with statuses outside the supported categories.
            return [];
        }

        // Convert valid durations into the shared outlier item structure.
        return value === null ? [] : [makeItem(defect, value)];
    });
}

/**
 * Detects unusually long defect resolution durations using the
 * interquartile range (IQR) method.
 *
 * The statistical threshold is calculated from resolved reports
 * in the baseline dataset:
 *
 *   IQR = Q3 - Q1
 *   Threshold = Q3 + multiplier * IQR
 *
 * The baseline is independent of the currently selected date range
 * when a separate baseline dataset is supplied.
 *
 * Both resolved resolution times and unresolved report ages are
 * evaluated against the calculated threshold.
 *
 * @param defects - Defect reports within the selected analysis period.
 * @param multiplier - Multiplier applied to the IQR when calculating the upper threshold.
 * @param unresolvedOnly - Whether to flag only unresolved reports.
 * @param referenceDate - Reference timestamp used to calculate unresolved report ages.
 * @param baselineDefects - Reports used to establish the statistical baseline.
 *   Defaults to the analysis dataset when not provided.
 * @returns Resolution outlier results, including observations, flagged reports,
 *   threshold, quartiles, and interquartile range.
 */
export function detectResolution(
    defects: Defect[],
    multiplier: number,
    unresolvedOnly: boolean,
    referenceDate: Date,
    baselineDefects: Defect[] = defects
): OutlierResult {
    // Global baseline: independent of the selected date range.
    const baselineItems = getDurationItems(
        baselineDefects,
        referenceDate
    );

    // Establish the baseline distribution using resolved reports only.
    const sorted = baselineItems
        .filter((item) => !isUnresolved(item.status))
        .map((item) => item.value)
        .sort((a, b) => a - b);

    // Calculate the first and third quartiles and the upper outlier threshold.
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const threshold = q3 + multiplier * iqr;

    // Observations: only reports in the selected date range.
    const items = getDurationItems(defects, referenceDate);

    // Flag durations above the baseline threshold, optionally restricting
    // results to unresolved reports, then rank by longest duration first.
    const flagged = items
        .filter(
            (item) =>
                item.value > threshold &&
                (!unresolvedOnly || isUnresolved(item.status))
        )
        .sort((a, b) => b.value - a.value);

    // Package the observations and statistical values for the outlier UI.
    return makeResult(
        "resolution",
        items,
        flagged,
        threshold,
        q1,
        q3,
        iqr
    );
}