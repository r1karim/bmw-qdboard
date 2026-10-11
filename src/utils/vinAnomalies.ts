import type { DefectRow } from "../components/defects/tableConfig";

/**
 * Vehicle attributes checked for inconsistencies across reports
 * associated with the same vehicle identification number (VIN).
 *
 * The readonly tuple also serves as the source for the VehicleField type.
 */
const VEHICLE_FIELDS = [
    "Car Model",
    "Motor Type",
    "Design Package",
] as const;

/**
 * Union type representing the vehicle attributes that can be
 * checked for inconsistencies.
 */
type VehicleField = (typeof VEHICLE_FIELDS)[number];

/**
 * Represents a VIN associated with conflicting vehicle information.
 *
 * An anomaly is identified when two or more defect reports for the
 * same VIN contain different non-empty values for at least one
 * monitored vehicle attribute.
 *
 * @property vin - Vehicle identification number associated with the anomaly.
 * @property reportCount - Total number of defect reports for the VIN.
 * @property conflictingFields - Vehicle attributes containing conflicting values.
 * @property values - Distinct non-empty values reported for each checked attribute.
 * @property reports - Original defect reports associated with the VIN.
 */
export type VinAnomaly = {
    vin: string;
    reportCount: number;
    conflictingFields: VehicleField[];
    values: Record<VehicleField, string[]>;
    reports: DefectRow[];
};

/**
 * Detects inconsistent vehicle attributes across defect reports
 * associated with the same VIN.
 *
 * Groups reports by VIN and compares the reported Car Model,
 * Motor Type, and Design Package values for each vehicle.
 *
 * A VIN is considered anomalous when:
 * - At least two defect reports exist for the same VIN.
 * - At least one monitored attribute has multiple distinct,
 *   non-empty reported values.
 *
 * Missing and empty attribute values are ignored during comparison.
 * The function identifies inconsistencies but does not determine
 * which reported values are correct.
 *
 * Results are sorted by the number of conflicting attributes,
 * followed by the number of associated defect reports.
 *
 * @param defects - Defect reports to analyze for VIN inconsistencies.
 * @returns Detected VIN anomalies, ordered by conflict count and report count.
 */
export function detectVinAnomalies(
    defects: DefectRow[]
): VinAnomaly[] {
    // Group all defect reports by their normalized VIN.
    const byVin = new Map<string, DefectRow[]>();

    for (const defect of defects) {
        // Convert the VIN to a trimmed string for consistent grouping.
        const vin = String(defect["VIN"] ?? "").trim();

        // Ignore reports without a valid, non-empty VIN.
        if (!vin) continue;

        // Append the report to the collection associated with its VIN.
        const reports = byVin.get(vin) ?? [];
        reports.push(defect);
        byVin.set(vin, reports);
    }

    // Collect vehicles containing at least one conflicting attribute.
    const anomalies: VinAnomaly[] = [];

    for (const [vin, reports] of byVin) {
        // A single report cannot establish a disagreement between records.
        if (reports.length < 2) continue;

        // Store the observed values and conflicting attributes for this VIN.
        const values = {} as Record<VehicleField, string[]>;
        const conflictingFields: VehicleField[] = [];

        // Compare each monitored vehicle attribute across the VIN's reports.
        for (const field of VEHICLE_FIELDS) {
            // Extract distinct, non-empty values for the current attribute.
            const distinctValues = [
                ...new Set(
                    reports
                        .map(report =>
                            String(report[field] ?? "").trim()
                        )
                        .filter(Boolean)
                ),
            ];

            // Preserve all distinct values for display in the investigation UI.
            values[field] = distinctValues;

            // Multiple distinct values indicate conflicting report information.
            if (distinctValues.length > 1) {
                conflictingFields.push(field);
            }
        }

        // Include only VINs with at least one detected attribute conflict.
        if (conflictingFields.length > 0) {
            anomalies.push({
                vin,
                reportCount: reports.length,
                conflictingFields,
                values,
                reports,
            });
        }
    }

    // Prioritize VINs with more conflicting attributes.
    // Use report count as a secondary ranking criterion.
    return anomalies.sort(
        (a, b) =>
            b.conflictingFields.length - a.conflictingFields.length ||
            b.reportCount - a.reportCount
    );
}