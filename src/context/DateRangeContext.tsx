
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

/**
 * Represents the selected date interval.
 *
 * Both boundaries are stored as strings in YYYY-MM-DD format.
 */
type DateRange = {
    start: string;
    end: string;
};

/**
 * Defines the date range state and its update function
 * shared through the context.
 */
type DateRangeContextValue = {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
};

// Create the context with a null default to detect missing providers.
const DateRangeContext = createContext<DateRangeContextValue | null>(null);

/**
 * Provides a shared date range to descendant components.
 *
 * Initializes the application with a default date interval
 * and allows components to update it through setDateRange.
 *
 * @param children - React components that can access the date range.
 */
export function DateRangeProvider({ children }: { children: ReactNode }) {
    // Store the currently selected date interval.
    const [dateRange, setDateRange] = useState<DateRange>({
        start: "2026-01-01",
        end: "2026-06-30",
    });

    // Expose the selected range and its setter to descendant components.
    return (
        <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
            {children}
        </DateRangeContext.Provider>
    );
}

/**
 * Custom hook for accessing the shared date range context.
 *
 * @returns The selected date range and its update function.
 * @throws Error if called outside DateRangeProvider.
 */
export function useDateRange() {
    const context = useContext(DateRangeContext);

    // Prevent accessing the context without its provider.
    if (!context) {
        throw new Error("useDateRange must be used inside DateRangeProvider");
    }

    return context;
}