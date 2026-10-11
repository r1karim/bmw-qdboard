import type { Defect, OutlierItem, OutlierResult } from "./types";
import { getValidNumber, isUnresolved, makeItem, makeResult } from "./shared";

function quantile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;

    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) return sorted[lower];

    return sorted[lower] +
        (sorted[upper] - sorted[lower]) * (index - lower);
}

function getDurationItems(defects: Defect[], referenceDate: Date): OutlierItem[] {
    return defects.flatMap((defect) => {
        const status = defect["Resolution Status"]?.trim().toLowerCase();
        let value: number | null = null;

        if (status === "resolved") {
            value = getValidNumber(defect["Resolution Time (hours)"]);
        } else if (isUnresolved(status)) {
            const reportDate = defect["Report Date"]?.slice(0, 10);
            const reportTime = defect["Report Time"] || "00:00:00";
            const reportedAt = new Date(`${reportDate}T${reportTime}`);

            if (Number.isNaN(reportedAt.getTime())) return [];

            value = (referenceDate.getTime() - reportedAt.getTime()) /
                (1000 * 60 * 60);

            if (value < 0) return [];
        } else {
            return [];
        }

        return value === null ? [] : [makeItem(defect, value)];
    });
}

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

    const sorted = baselineItems
        .filter((item) => !isUnresolved(item.status))
        .map((item) => item.value)
        .sort((a, b) => a - b);

    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const threshold = q3 + multiplier * iqr;

    // Observations: only reports in the selected date range.
    const items = getDurationItems(defects, referenceDate);

    const flagged = items
        .filter(
            (item) =>
                item.value > threshold &&
                (!unresolvedOnly || isUnresolved(item.status))
        )
        .sort((a, b) => b.value - a.value);

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