
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

type DateRange = {
    start: string;
    end: string;
};

type DateRangeContextValue = {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
};

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
    const [dateRange, setDateRange] = useState<DateRange>({
        start: "2026-01-01",
        end: "2026-06-30",
    });

    return (
        <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
            {children}
        </DateRangeContext.Provider>
    );
}

export function useDateRange() {
    const context = useContext(DateRangeContext);

    if (!context) {
        throw new Error("useDateRange must be used inside DateRangeProvider");
    }

    return context;
}
