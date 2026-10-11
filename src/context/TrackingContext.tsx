import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// Supported investigation workflow statuses.
export type InvestigationStatus = "To Review" | "Investigating" | "Closed";

// Structure of a saved defect investigation.
export type TrackingRecord = {
    defectId: string;
    note: string;
    investigationStatus: InvestigationStatus;
    updatedAt: string;
};

// Data and actions made available through the tracking context.
type TrackingContextValue = {
    records: Record<string, TrackingRecord>;
    saveRecord: (defectId: string, note: string, investigationStatus: InvestigationStatus) => void;
    unflag: (defectId: string) => void;
};

// Browser storage key used to persist investigation records.
const STORAGE_KEY = "bmw-quality-investigations-v1";

// Initialize the context without a default value.
// Components must access it through the TrackingProvider.
const TrackingContext = createContext<TrackingContextValue | null>(null);

/**
 * Load previously saved investigation records from localStorage.
 *
 * Validates the stored data before using it to prevent malformed
 * or outdated records from entering the application state.
 *
 * @returns Valid investigation records indexed by Defect ID,
 *          or an empty object if storage is missing or invalid.
 */
function loadRecords(): Record<string, TrackingRecord> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};

        // Parse stored JSON and verify that it contains an object.
        const parsed: unknown = JSON.parse(stored);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

        // Keep only records containing the expected fields and valid statuses.
        return Object.fromEntries(
            Object.entries(parsed).filter(([id, record]) => {
                if (!id || !record || typeof record !== "object") return false;
                const value = record as Partial<TrackingRecord>;
                return value.defectId === id && typeof value.note === "string" &&
                    ["To Review", "Investigating", "Closed"].includes(value.investigationStatus ?? "") &&
                    typeof value.updatedAt === "string";
            })
        ) as Record<string, TrackingRecord>;
    } catch {
        // Invalid JSON or unavailable browser storage should not crash the app.
        return {};
    }
}

/**
 * Provides shared investigation records and tracking actions
 * to components throughout the application.
 *
 * Initializes records from localStorage and automatically persists
 * changes whenever an investigation is saved or removed.
 *
 * @param children - React components that can access the tracking context.
 */
export function TrackingProvider({ children }: { children: ReactNode }) {
    // Initialize tracking state using previously saved browser data.
    const [records, setRecords] = useState<Record<string, TrackingRecord>>(loadRecords);

    // Persist investigation records whenever the tracking state changes.
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
        catch { /* Storage may be unavailable or full. */ }
    }, [records]);

    /**
     * Create or update an investigation record for a defect.
     *
     * Records are indexed by Defect ID, so saving an existing ID
     * replaces its previous note, status, and update timestamp.
     *
     * @param defectId - Unique identifier of the defect report.
     * @param note - Engineer's investigation note.
     * @param investigationStatus - Current investigation workflow status.
     */
    const saveRecord = useCallback((defectId: string, note: string, investigationStatus: InvestigationStatus) => {
        if (!defectId.trim()) return;

        // Preserve other investigations while creating or updating this record.
        setRecords(previous => ({
            ...previous,
            [defectId]: { defectId, note, investigationStatus, updatedAt: new Date().toISOString() },
        }));
    }, []);

    /**
     * Remove a defect from investigation tracking.
     *
     * Deleting the record also removes its saved engineer note
     * and investigation status.
     *
     * @param defectId - Identifier of the defect to remove.
     */
    const unflag = useCallback((defectId: string) => {
        setRecords(previous => {
            const next = { ...previous };
            delete next[defectId];
            return next;
        });
    }, []);

    return <TrackingContext.Provider value={{ records, saveRecord, unflag }}>{children}</TrackingContext.Provider>;
}

/**
 * Custom hook for accessing the shared investigation tracking context.
 *
 * Ensures that the calling component is wrapped in TrackingProvider.
 *
 * @returns Investigation records and functions for saving or removing them.
 * @throws Error if used outside TrackingProvider.
 */
export function useTracking() {
    const context = useContext(TrackingContext);
    if (!context) throw new Error("useTracking must be used inside TrackingProvider");
    return context;
}
