
export type OutlierMetric = "resolution" | "vin" | "severity";

export type OutlierDefect = {
    "Defect ID": string;
    "Report Date": string;
    "Report Time": string;
    "Resolution Status": string;
    "Resolution Time (hours)": number | string | null;
    "Severity Rating": number | string | null;
    VIN: string;
    "Station Name": string;
};

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

function getValidNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0 ? number : null;
}

function isUnresolved(status?: string): boolean {
    const normalized = status?.trim().toLowerCase();
    return normalized === "open" || normalized === "in progress";
}

function makeItem(defect: OutlierDefect, value: number): OutlierItem {
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

function getDurationItems(
    defects: OutlierDefect[],
    referenceDate: Date
): OutlierItem[] {
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

            value =
                (referenceDate.getTime() - reportedAt.getTime()) /
                (1000 * 60 * 60);

            if (value < 0) return [];
        } else {
            return [];
        }

        return value === null ? [] : [makeItem(defect, value)];
    });
}

function getSeverityItems(defects: OutlierDefect[]): OutlierItem[] {
    return defects.flatMap((defect) => {
        const value = getValidNumber(defect["Severity Rating"]);

        if (
            value === null ||
            !Number.isInteger(value) ||
            value < 1 ||
            value > 10
        ) {
            return [];
        }

        return [makeItem(defect, value)];
    });
}

function getVinItems(defects: OutlierDefect[]): OutlierItem[] {
    const counts = new Map<string, number>();

    for (const defect of defects) {
        const vin = defect.VIN?.trim();
        if (!vin) continue;

        counts.set(vin, (counts.get(vin) ?? 0) + 1);
    }

    return Array.from(counts, ([vin, count]) => ({
        id: vin,
        label: vin,
        value: count,
        date: "",
        vin,
    })).sort((a, b) => b.value - a.value);
}

function makeResult(
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
        flaggedShare:
            items.length > 0
                ? (flagged.length / items.length) * 100
                : 0,
        flagged,
    };
}

export function detectOutliers(
    defects: OutlierDefect[],
    metric: OutlierMetric,
    multiplier = 1.5,
    unresolvedOnly = false,
    referenceDate = new Date(2026, 5, 30, 23, 59, 59),
    severityThreshold = 2
): OutlierResult {
    if (metric === "severity") {
        const items = getSeverityItems(defects);
        const threshold = Math.max(
            1,
            Math.min(10, Math.round(severityThreshold))
        );

        const flagged = items
            .filter(
                (item) =>
                    item.value <= threshold &&
                    (!unresolvedOnly || isUnresolved(item.status))
            )
            .sort((a, b) => a.value - b.value);

        return makeResult("severity", items, flagged, threshold);
    }

    if (metric === "vin") {
        const items = getVinItems(defects);

        const unresolvedVins = new Set(
            defects
                .filter((defect) =>
                    isUnresolved(defect["Resolution Status"])
                )
                .map((defect) => defect.VIN?.trim())
                .filter((vin): vin is string => Boolean(vin))
        );

        const flagged = items.filter(
            (item) =>
                item.value > 1 &&
                (!unresolvedOnly ||
                    (item.vin !== undefined && unresolvedVins.has(item.vin)))
        );

        return makeResult("vin", items, flagged, 1);
    }

    const items = getDurationItems(defects, referenceDate);
    const sorted = items
        .map((item) => item.value)
        .sort((a, b) => a - b);

    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const threshold = q3 + multiplier * iqr;

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
