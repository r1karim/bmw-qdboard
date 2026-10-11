/**
 * Represents a defect report used throughout the dashboard analytics system.
 *
 * Contains the report identifier, vehicle information, production station,
 * defect classification, resolution details, and reporting timestamp.
 *
 * The property names correspond to fields in the source defect dataset.
 *
 * Optional properties represent fields that may be absent from a report,
 * while "Resolution Time (hours)" explicitly allows null values.
 */
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

/**
 * Filters defect reports by an inclusive date range.
 *
 * Extracts the YYYY-MM-DD portion of each report date and compares
 * it against the supplied start and end dates.
 *
 * Date comparisons rely on consistently formatted ISO-style
 * date strings (YYYY-MM-DD), which preserve chronological ordering
 * when compared lexicographically.
 *
 * @param defects - Defect reports to filter.
 * @param start - Inclusive start date in YYYY-MM-DD format.
 * @param end - Inclusive end date in YYYY-MM-DD format.
 * @returns Defect reports whose report dates fall within the range.
 */
export function filterByDate(
    defects: Defect[],
    start: string,
    end: string
) {
    return defects.filter((d) => {
        // Extract the date portion without the optional time component.
        const date = d["Report Date"]?.slice(0, 10);

        // Include reports on both the start and end dates.
        return date >= start && date <= end;
    });
}

/**
 * Counts defect reports grouped by a selected defect field.
 *
 * Converts each field value to a trimmed string and uses "Unknown"
 * when the value is missing, null, or empty.
 *
 * Supports grouping by any property defined in the Defect type,
 * including vehicle attributes, station information, defect
 * categories, and resolution statuses.
 *
 * @param defects - Defect reports to aggregate.
 * @param field - Defect property used to group the reports.
 * @returns A record mapping each distinct field value to its report count.
 */
export function countBy(
    defects: Defect[],
    field: keyof Defect
): Record<string, number> {
    // Accumulate report counts for each distinct field value.
    return defects.reduce<Record<string, number>>((counts, d) => {
        // Normalize the grouping value and handle missing information.
        const value = String(d[field] ?? "").trim() || "Unknown";

        // Increment the number of reports belonging to this group.
        counts[value] = (counts[value] || 0) + 1;

        return counts;
    }, {});
}

/**
 * Generates daily defect report counts for a specified date range.
 *
 * First aggregates reports by their reporting date, then creates
 * a continuous sequence of daily data points between the supplied
 * start and end dates, including both boundaries.
 *
 * Dates without defect reports are assigned a count of zero,
 * ensuring that charts display gaps in reporting activity rather
 * than omitting those days entirely.
 *
 * The date iteration uses local noon timestamps to reduce potential
 * issues when advancing dates across daylight saving time changes.
 *
 * @param defects - Defect reports to aggregate by date.
 * @param start - Inclusive start date in YYYY-MM-DD format.
 * @param end - Inclusive end date in YYYY-MM-DD format.
 * @returns Chronologically ordered daily data points containing
 *   a date string and its corresponding defect report count.
 */
export function createTrendData(
    defects: Defect[],
    start: string,
    end: string
) {
    // Store the number of defect reports recorded on each date.
    const dailyCounts: Record<string, number> = {};

    for (const defect of defects) {
        // Extract the YYYY-MM-DD portion of the report date.
        const date = defect["Report Date"]?.slice(0, 10);

        // Count reports only when a date value is available.
        if (date) {
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
    }

    // Prepare the chronological data points consumed by the trend chart.
    const data: { date: string; count: number }[] = [];

    // Initialize the inclusive date range using local noon timestamps.
    const current = new Date(`${start}T12:00:00`);
    const last = new Date(`${end}T12:00:00`);

    // Generate one data point for every calendar day in the selected range.
    while (current <= last) {
        // Format the current date as a zero-padded YYYY-MM-DD string.
        const date = [
            current.getFullYear(),
            String(current.getMonth() + 1).padStart(2, "0"),
            String(current.getDate()).padStart(2, "0"),
        ].join("-");

        // Use zero when no defect reports exist for the current date.
        data.push({
            date,
            count: dailyCounts[date] ?? 0,
        });

        // Advance to the next calendar day.
        current.setDate(current.getDate() + 1);
    }

    return data;
}