
export type OutlierMetric = "resolution" | "rework" | "daily";

export type OutlierDefect = {
    "Defect ID": string;
    "Report Date": string;
    VIN: string;
    "Station Name": string;
    "Resolution Time (hours)": number | string | null;
    "Rework Time (minutes)": number | string | null;
    "Resolution Status": string;
};

export type OutlierItem = {
    id: string;
    label: string;
    value: number;
    date: string;
    vin?: string;
    station?: string;
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

// Linear interpolation between sorted values.
// This matches the default percentile behavior used by pandas.
function quantile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;

    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) return sorted[lower];

    return (
        sorted[lower] +
        (sorted[upper] - sorted[lower]) * (index - lower)
    );
}

function analyze(
    items: OutlierItem[],
    metric: OutlierMetric,
    multiplier: number
): OutlierResult {
    const sorted = items.map((item) => item.value).sort((a, b) => a - b);

    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const threshold = q3 + multiplier * iqr;

    const flagged = items
        .filter((item) => item.value > threshold)
        .sort((a, b) => b.value - a.value);

    return {
        metric,
        threshold,
        q1,
        q3,
        iqr,
        total: items.length,
        flaggedCount: flagged.length,
        flaggedShare:
            items.length > 0 ? (flagged.length / items.length) * 100 : 0,
        flagged,
    };
}

function getValidNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

function getDurationItems(
    defects: OutlierDefect[],
    metric: "resolution" | "rework"
): OutlierItem[] {
    const column =
        metric === "resolution"
            ? "Resolution Time (hours)"
            : "Rework Time (minutes)";

    return defects.flatMap((defect) => {
        const value = getValidNumber(defect[column]);

        if (value === null) return [];

        return [{
            id: String(defect["Defect ID"]),
            label: String(defect["Defect ID"]),
            value,
            date: defect["Report Date"]?.slice(0, 10) ?? "",
            vin: defect.VIN,
            station: defect["Station Name"],
        }];
    });
}

function getDailyItems(
    defects: OutlierDefect[],
    startDate: string,
    endDate: string
): OutlierItem[] {
    const counts = new Map<string, number>();

    for (const defect of defects) {
        const date = defect["Report Date"]?.slice(0, 10);

        if (date && date >= startDate && date <= endDate) {
            counts.set(date, (counts.get(date) ?? 0) + 1);
        }
    }

    const items: OutlierItem[] = [];
    const current = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    while (current <= end) {
        const date = current.toISOString().slice(0, 10);

        items.push({
            id: date,
            label: date,
            value: counts.get(date) ?? 0,
            date,
        });

        current.setUTCDate(current.getUTCDate() + 1);
    }

    return items;
}

/**
 * Detects unusually high values using Tukey's upper IQR fence.
 *
 * Threshold = Q3 + multiplier * (Q3 - Q1)
 *
 * The threshold is recalculated from the selected data rather than
 * using a fixed number of hours, minutes, or defect reports.
 *
 * Duration metrics exclude missing or invalid values.
 * Daily counts include zero-report days in the selected date range.
 *
 * Limitations:
 * - IQR detects statistical extremes, not confirmed quality failures.
 * - Daily counts are not normalized by production volume.
 * - A short date range may produce unstable thresholds.
 */
export function detectOutliers(
    defects: OutlierDefect[],
    metric: OutlierMetric,
    multiplier = 1.5,
    startDate?: string,
    endDate?: string
): OutlierResult {
    if (metric === "daily") {
        if (!startDate || !endDate || startDate > endDate) {
            return analyze([], metric, multiplier);
        }

        return analyze(
            getDailyItems(defects, startDate, endDate),
            metric,
            multiplier
        );
    }

    return analyze(getDurationItems(defects, metric), metric, multiplier);
}
