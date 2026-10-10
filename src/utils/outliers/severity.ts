import type { OutlierDefect, OutlierItem, OutlierResult } from "./types";
import { getValidNumber, isUnresolved, makeItem, makeResult } from "./shared";

export function detectSeverity(
    defects: OutlierDefect[],
    severityThreshold: number,
    unresolvedOnly: boolean
): OutlierResult {
    const items: OutlierItem[] = defects.flatMap((defect) => {
        const value = getValidNumber(defect["Severity Rating"]);
        if (value === null || !Number.isInteger(value) || value < 1 || value > 10) return [];
        return [makeItem(defect, value)];
    });

    const threshold = Math.max(1, Math.min(10, Math.round(severityThreshold)));
    const flagged = items
        .filter((item) => item.value <= threshold && (!unresolvedOnly || isUnresolved(item.status)))
        .sort((a, b) => a.value - b.value);

    return makeResult("severity", items, flagged, threshold);
}
