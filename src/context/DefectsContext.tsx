import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Defect } from "../utils/dashboardAnalytics";
type DefectsContextValue = {
    defects: Defect[];
    loading: boolean;
    error: string;
};

const DefectsContext = createContext<DefectsContextValue | null>(null);

export function DefectsProvider({ children }: { children: ReactNode }) {
    const [defects, setDefects] = useState<Defect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const response = await fetch("/data/defects.json", {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Failed to load defect data");
                const data: Defect[] = await response.json();
                if (!controller.signal.aborted) setDefects(data);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Failed to load defect data");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void load();
        return () => controller.abort();
    }, []);

    return (
        <DefectsContext.Provider value={{ defects, loading, error }}>
            {children}
        </DefectsContext.Provider>
    );
}

export function useDefects() {
    const context = useContext(DefectsContext);
    if (!context) throw new Error("useDefects must be used within DefectsProvider");
    return context;
}
