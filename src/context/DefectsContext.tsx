
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Defect } from "../utils/dashboardAnalytics";

// Defines the defect data and request states available through the context.
type DefectsContextValue = {
    defects: Defect[];
    loading: boolean;
    error: string;
};

// Create a shared context for accessing defect records.
// The null default allows us to detect usage outside the provider.
const DefectsContext = createContext<DefectsContextValue | null>(null);

/**
 * Provides the shared defect dataset to the application.
 *
 * Loads defect records from the static JSON file when the provider
 * mounts and exposes the data, loading state, and error message
 * to all descendant components.
 *
 * @param children - React components that can access the defect context.
 */
export function DefectsProvider({ children }: { children: ReactNode }) {
    // Store the loaded defect records.
    const [defects, setDefects] = useState<Defect[]>([]);

    // Track whether the initial data request is still in progress.
    const [loading, setLoading] = useState(true);

    // Store an error message if the data request fails.
    const [error, setError] = useState("");

    // Load the defect dataset when the provider mounts.
    useEffect(() => {
        // Allow the request to be cancelled if the provider unmounts.
        const controller = new AbortController();

        /**
         * Fetch and initialize the shared defect dataset.
         *
         * Handles unsuccessful responses, request errors,
         * and cancellation during component cleanup.
         */
        async function load() {
            try {
                // Retrieve the static JSON dataset from the public directory.
                const response = await fetch("/data/defects.json", {
                    signal: controller.signal,
                });

                // Reject unsuccessful HTTP responses.
                if (!response.ok) throw new Error("Failed to load defect data");

                // Parse the response as an array of defect records.
                const data: Defect[] = await response.json();

                // Update state only if the request has not been cancelled.
                if (!controller.signal.aborted) setDefects(data);
            } catch (err) {
                // Ignore errors caused by cancellation during cleanup.
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Failed to load defect data");
                }
            } finally {
                // End the loading state unless the request was cancelled.
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        // Start the asynchronous request without awaiting it in the effect.
        void load();

        // Cancel any unfinished request when the provider unmounts.
        return () => controller.abort();
    }, []);

    // Make the dataset and request states available to descendant components.
    return (
        <DefectsContext.Provider value={{ defects, loading, error }}>
            {children}
        </DefectsContext.Provider>
    );
}

/**
 * Custom hook for accessing the shared defect dataset.
 *
 * Provides defect records along with loading and error states.
 * Ensures that the calling component is wrapped in DefectsProvider.
 *
 * @returns The shared defect dataset and its request states.
 * @throws Error if used outside DefectsProvider.
 */
export function useDefects() {
    const context = useContext(DefectsContext);

    if (!context) throw new Error("useDefects must be used within DefectsProvider");

    return context;
}
