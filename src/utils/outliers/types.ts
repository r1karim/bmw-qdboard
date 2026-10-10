export type OutlierMetric = "resolution" | "vin" | "severity";
import type { Defect } from "../dashboardAnalytics";
export type { Defect };

export type OutlierItem = {
    id: string;
    label: string;
    value: number;
    date: string;
    vin?: string;
    station?: string;
    status?: string;
};

export type OutlierResult = {
    metric: OutlierMetric;
    threshold: number;
    q1: number;
    q3: number;
    iqr: number;
    total: number;
    flaggedCount: number;
    flaggedShare: number;
    flagged: OutlierItem[];
};
