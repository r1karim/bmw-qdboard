import type { Defect } from "../dashboardAnalytics";
import type { OutlierMetric, OutlierResult} from "./types";
import { detectResolution } from "./resolution";
import { detectSeverity } from "./severity";
import { detectVin } from "./vin";

export type {  OutlierItem, OutlierMetric, OutlierResult } from "./types";

export function detectOutliers(
    defects: Defect[],
    metric: OutlierMetric,
    multiplier = 1.5,
    unresolvedOnly = false,
    referenceDate = new Date(2026, 5, 30, 23, 59, 59),
    severityThreshold = 2
): OutlierResult {
    switch (metric) {
        case "severity":
            return detectSeverity(defects, severityThreshold, unresolvedOnly);
        case "vin":
            return detectVin(defects, unresolvedOnly);
        case "resolution":
            return detectResolution(defects, multiplier, unresolvedOnly, referenceDate);
    }
}
