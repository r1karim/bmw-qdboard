export type DefectRow = Record<string, string | number | null>;
export type SortDirection = "asc" | "desc";
export const PAGE_SIZE = 25;
export const COLUMNS = [
    "Defect ID", "Report Date", "Report Time", "Production Date", "VIN",
    "Car Model", "Motor Type", "Design Package", "Station ID", "Station Name",
    "Part Number", "Part Name", "Supplier", "Defect Name", "Defect Category",
    "Severity Rating", "Inspector ID", "Production Shift", "Resolution Status",
    "Resolution Timestamp", "Resolution Time (hours)", "Root Cause Identified",
    "Rework Time (minutes)",
] as const;
