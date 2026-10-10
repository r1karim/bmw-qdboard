import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type InvestigationStatus = "To Review" | "Investigating" | "Closed";
export type TrackingRecord = {
    defectId: string;
    note: string;
    investigationStatus: InvestigationStatus;
    updatedAt: string;
};

type TrackingContextValue = {
    records: Record<string, TrackingRecord>;
    saveRecord: (defectId: string, note: string, investigationStatus: InvestigationStatus) => void;
    unflag: (defectId: string) => void;
};

const STORAGE_KEY = "bmw-quality-investigations-v1";
const TrackingContext = createContext<TrackingContextValue | null>(null);

function loadRecords(): Record<string, TrackingRecord> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        const parsed: unknown = JSON.parse(stored);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
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
        return {};
    }
}

export function TrackingProvider({ children }: { children: ReactNode }) {
    const [records, setRecords] = useState<Record<string, TrackingRecord>>(loadRecords);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
        catch { /* Storage may be unavailable or full. */ }
    }, [records]);

    const saveRecord = useCallback((defectId: string, note: string, investigationStatus: InvestigationStatus) => {
        if (!defectId.trim()) return;
        setRecords(previous => ({
            ...previous,
            [defectId]: { defectId, note, investigationStatus, updatedAt: new Date().toISOString() },
        }));
    }, []);

    const unflag = useCallback((defectId: string) => {
        setRecords(previous => {
            const next = { ...previous };
            delete next[defectId];
            return next;
        });
    }, []);

    return <TrackingContext.Provider value={{ records, saveRecord, unflag }}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
    const context = useContext(TrackingContext);
    if (!context) throw new Error("useTracking must be used inside TrackingProvider");
    return context;
}
