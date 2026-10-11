/**
 * Represents a defect report as a collection of field names and values.
 *
 * Each field is identified by a string key, corresponding to a column
 * in the defect dataset. Values may be strings, numbers, or null.
 *
 * This flexible structure supports accessing defect properties
 * using their original dataset column names.
 */
export type DefectRow = Record<string, string | number | null>;

/**
 * Defines the available columns in the defect dataset.
 *
 * The column order follows the original data structure and includes
 * defect identification, vehicle information, production details,
 * severity, resolution status, and rework information.
 *
 * The `as const` assertion preserves each column name as a string
 * literal and makes the array readonly at the TypeScript type level.
 */
export const COLUMNS = [
    "Defect ID", "Report Date", "Report Time", "Production Date", "VIN",
    "Car Model", "Motor Type", "Design Package", "Station ID", "Station Name",
    "Part Number", "Part Name", "Supplier", "Defect Name", "Defect Category",
    "Severity Rating", "Inspector ID", "Production Shift", "Resolution Status",
    "Resolution Timestamp", "Resolution Time (hours)", "Root Cause Identified",
    "Rework Time (minutes)",
] as const;
