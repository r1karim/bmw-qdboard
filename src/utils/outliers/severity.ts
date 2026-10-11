import type {Defect, OutlierItem, OutlierResult} from "./types";
import { getValidNumber, isUnresolved, makeItem, makeResult } from "./shared";

/**
 * Detects defect reports with severity ratings at or below a configured threshold.
 *
 * Only valid integer severity ratings between 1 and 10 are included
 * in the analysis. The configured threshold is rounded to the nearest
 * integer and constrained to the same range.
 *
 * Reports with severity ratings less than or equal to the threshold
 * are flagged, with an optional filter for unresolved reports only.
 *
 * Flagged reports are sorted by ascending severity rating so that
 * the lowest-rated reports appear first.
 *
 * @param defects - Defect reports to evaluate.
 * @param severityThreshold - Maximum severity rating to flag.
 * @param unresolvedOnly - Whether to flag only unresolved defect reports.
 * @returns Outlier detection results containing valid observations,
 *   flagged reports, and the normalized severity threshold.
 */
export function detectSeverity(
    defects: Defect[],
    severityThreshold: number,
    unresolvedOnly: boolean
): OutlierResult {
    // Convert reports into severity observations, excluding invalid ratings.
    const items: OutlierItem[] = defects.flatMap((defect) => {
        // Parse the severity rating as a valid numeric value.
        const value = getValidNumber(defect["Severity Rating"]);

        // Accept only whole-number severity ratings within the 1–10 scale.
        if (value === null || !Number.isInteger(value) || value < 1 || value > 10) return [];

        // Convert the validated report into the shared outlier item structure.
        return [makeItem(defect, value)];
    });

    // Round the configured threshold and constrain it to the valid severity scale.
    const threshold = Math.max(1, Math.min(10, Math.round(severityThreshold)));

    // Flag reports meeting the severity threshold, optionally excluding
    // resolved reports, and place the lowest severity ratings first.
    const flagged = items
        .filter((item) => item.value <= threshold && (!unresolvedOnly || isUnresolved(item.status)))
        .sort((a, b) => a.value - b.value);

    // Return the observations, flagged reports, and applied threshold.
    return makeResult("severity", items, flagged, threshold);
}