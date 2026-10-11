import { useMemo } from "react";
import { useDateRange } from "../context/DateRangeContext";
import { useDefects } from "../context/DefectsContext.tsx";

/**
 * Custom hook providing defect data for the Outlier Detection page.
 *
 * Retrieves the complete defect dataset and filters reports according
 * to the globally selected date range.
 *
 * Returns both the original and filtered datasets, allowing outlier
 * analytics to use either dataset depending on the calculation.
 */
export default function useOutlierData() {
    // Access the globally selected start and end dates.
    const { dateRange } = useDateRange();

    // Retrieve defect records and their loading/error states.
    const { defects, loading, error } = useDefects();

    // Include only reports whose Report Date falls within the selected range.
    // useMemo avoids recalculating unless the data or date range changes.
    const filteredDefects = useMemo(
        () => defects.filter((defect) => {
            // Extract the YYYY-MM-DD portion of the report date.
            const date = defect["Report Date"]?.slice(0, 10);

            // Exclude missing dates and include both date range boundaries.
            return Boolean(
                date &&
                date >= dateRange.start &&
                date <= dateRange.end
            );
        }),
        [defects, dateRange.start, dateRange.end]
    );

    // Expose the complete dataset, filtered records, and loading state.
    return {
        defects,
        filteredDefects,
        loading,
        error,
    };
}