import type { Defect } from "../dashboardAnalytics";
import type { OutlierMetric, OutlierResult} from "./types";
import { detectResolution } from "./resolution";
import { detectSeverity } from "./severity";
import { detectVin } from "./vin";

export type {  OutlierItem, OutlierMetric, OutlierResult } from "./types";

export function detectOutliers(
    filteredDefects: Defect[],
    defects: Defect[],
    metric: OutlierMetric,
    multiplier = 1.5,
    unresolvedOnly = false,
    referenceDate = new Date(2026, 5, 30, 23, 59, 59),
    severityThreshold = 2
): OutlierResult {
    switch (metric) {
        case "severity":
            return detectSeverity(
                filteredDefects,
                severityThreshold,
                unresolvedOnly
            );
        case "vin":
            return detectVin(
                filteredDefects,
                unresolvedOnly
            );
        case "resolution":
            return detectResolution(
                filteredDefects,
                multiplier,
                unresolvedOnly,
                referenceDate,
                defects
            );
    }
}
