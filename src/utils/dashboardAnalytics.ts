export type Defect = {
    "Defect ID": string | number;
    VIN: string;
    "Station ID"?: string;
    "Report Time"?: string;
    "Severity Rating"?: string | number;
    "Car Model": string;
    "Motor Type": string;
    "Design Package": string;
    "Resolution Status": string;
    "Defect Category": string;
    "Report Date": string;
    "Station Name": string;
    "Resolution Time (hours)": number | null;
    "Defect Name": string;
};

export function filterByDate(
    defects: Defect[],
    start: string,
    end: string
) {
    return defects.filter((d) => {
        const date = d["Report Date"]?.slice(0, 10);
        return date >= start && date <= end;
    });
}

export function countBy(
    defects: Defect[],
    field: keyof Defect
): Record<string, number> {
    return defects.reduce<Record<string, number>>((counts, d) => {
        const value = String(d[field] ?? "").trim() || "Unknown";
        counts[value] = (counts[value] || 0) + 1;
        return counts;
    }, {});
}

export function createTrendData(
    defects: Defect[],
    start: string,
    end: string
) {
    const dailyCounts: Record<string, number> = {};

    for (const defect of defects) {
        const date = defect["Report Date"]?.slice(0, 10);

        if (date) {
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
    }

    const data: { date: string; count: number }[] = [];

    const current = new Date(`${start}T12:00:00`);
    const last = new Date(`${end}T12:00:00`);

    while (current <= last) {
        const date = [
            current.getFullYear(),
            String(current.getMonth() + 1).padStart(2, "0"),
            String(current.getDate()).padStart(2, "0"),
        ].join("-");

        data.push({
            date,
            count: dailyCounts[date] ?? 0,
        });

        current.setDate(current.getDate() + 1);
    }

    return data;
}