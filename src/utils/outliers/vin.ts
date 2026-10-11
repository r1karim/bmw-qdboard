import type { Defect, OutlierItem, OutlierResult } from "./types";
import { isUnresolved, makeResult } from "./shared";

/**
 * Detects VINs associated with multiple defect reports.
 *
 * Groups defect reports by their vehicle identification number (VIN)
 * and counts how many reports belong to each vehicle.
 *
 * A VIN is flagged when it has more than one defect report.
 * When unresolved-only filtering is enabled, the VIN must also have
 * at least one report with an unresolved status.
 *
 * Reports without a valid, non-empty VIN are excluded from the analysis.
 *
 * @param defects - Defect reports to analyze.
 * @param unresolvedOnly - Whether to flag only VINs with at least
 *   one unresolved defect report.
 * @returns Outlier detection results containing VIN report counts,
 *   flagged VINs, and the applied threshold.
 */
export function detectVin(defects: Defect[], unresolvedOnly: boolean): OutlierResult {
    // Count the number of defect reports associated with each VIN.
    const counts = new Map<string, number>();

    for (const defect of defects) {
        // Normalize surrounding whitespace and skip missing VINs.
        const vin = defect.VIN?.trim();
        if (!vin) continue;

        // Increment the report count for the current vehicle.
        counts.set(vin, (counts.get(vin) ?? 0) + 1);
    }

    // Convert VIN counts into standardized outlier observations.
    // Sort by descending report count so the most frequently reported VINs appear first.
    const items: OutlierItem[] = Array.from(counts, ([vin, count]) => ({
        id: vin,
        label: vin,
        value: count,
        date: "",
        vin,
    })).sort((a, b) => b.value - a.value);

    // Identify VINs associated with at least one unresolved defect report.
    const unresolvedVins = new Set(
        defects
            // Keep only reports whose resolution status is open or in progress.
            .filter((defect) => isUnresolved(defect["Resolution Status"]))
            // Extract and normalize their VINs.
            .map((defect) => defect.VIN?.trim())
            // Exclude missing or empty VINs using a TypeScript type guard.
            .filter((vin): vin is string => Boolean(vin))
    );

    // Flag VINs with multiple reports, optionally requiring at least
    // one unresolved report for the same vehicle.
    const flagged = items.filter(
        (item) => item.value > 1 &&
            (!unresolvedOnly || (item.vin !== undefined && unresolvedVins.has(item.vin)))
    );

    // Return the standardized results with a threshold of one report.
    return makeResult("vin", items, flagged, 1);
}