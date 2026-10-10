import { useMemo } from "react";
import { useDateRange } from "../context/DateRangeContext";
import { useDefects } from "../context/DefectsContext.tsx";

export default function useOutlierData() {
    const { dateRange } = useDateRange();
    const { defects, loading, error } = useDefects();

    const filteredDefects = useMemo(
        () => defects.filter((defect) => {
            const date = defect["Report Date"]?.slice(0, 10);
            return Boolean(
                date &&
                date >= dateRange.start &&
                date <= dateRange.end
            );
        }),
        [defects, dateRange.start, dateRange.end]
    );

    return {
        defects,
        filteredDefects,
        loading,
        error,
    };
}