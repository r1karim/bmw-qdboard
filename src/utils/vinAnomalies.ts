import type { DefectRow } from "../components/defects/tableConfig";

const VEHICLE_FIELDS = [
    "Car Model",
    "Motor Type",
    "Design Package",
] as const;

type VehicleField = (typeof VEHICLE_FIELDS)[number];

export type VinAnomaly = {
    vin: string;
    reportCount: number;
    conflictingFields: VehicleField[];
    values: Record<VehicleField, string[]>;
    reports: DefectRow[];
};

export function detectVinAnomalies(
    defects: DefectRow[]
): VinAnomaly[] {
    const byVin = new Map<string, DefectRow[]>();

    for (const defect of defects) {
        const vin = String(defect["VIN"] ?? "").trim();

        if (!vin) continue;

        const reports = byVin.get(vin) ?? [];
        reports.push(defect);
        byVin.set(vin, reports);
    }

    const anomalies: VinAnomaly[] = [];

    for (const [vin, reports] of byVin) {
        if (reports.length < 2) continue;

        const values = {} as Record<VehicleField, string[]>;
        const conflictingFields: VehicleField[] = [];

        for (const field of VEHICLE_FIELDS) {
            const distinctValues = [
                ...new Set(
                    reports
                        .map(report =>
                            String(report[field] ?? "").trim()
                        )
                        .filter(Boolean)
                ),
            ];

            values[field] = distinctValues;

            if (distinctValues.length > 1) {
                conflictingFields.push(field);
            }
        }

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

    return anomalies.sort(
        (a, b) =>
            b.conflictingFields.length - a.conflictingFields.length ||
            b.reportCount - a.reportCount
    );
}