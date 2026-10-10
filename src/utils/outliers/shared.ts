import type { OutlierDefect, OutlierItem, OutlierMetric, OutlierResult } from "./types";

export function getValidNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

export function isUnresolved(status?: string): boolean {
    const normalized = status?.trim().toLowerCase();
    return normalized === "open" || normalized === "in progress";
}

export function makeItem(defect: OutlierDefect, value: number): OutlierItem {
    return {
        id: String(defect["Defect ID"]),
        label: String(defect["Defect ID"]),
        value,
        date: defect["Report Date"]?.slice(0, 10) ?? "",
        vin: defect.VIN,
        station: defect["Station Name"],
        status: defect["Resolution Status"],
    };
}

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
        metric,
        threshold,
        q1,
        q3,
        iqr,
        total: items.length,
        flaggedCount: flagged.length,
        flaggedShare: items.length > 0 ? (flagged.length / items.length) * 100 : 0,
        flagged,
    };
}
