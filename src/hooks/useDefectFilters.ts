import { useMemo } from "react";
import { useSearchParams } from "react-router";
import type { Defect } from "../utils/dashboardAnalytics";

export type FilterKey = "category" | "model" | "defectName";

export const FILTERS = [
    { key: "category", label: "Defect Category", field: "Defect Category" },
    { key: "model", label: "Car Model", field: "Car Model" },
    { key: "defectName", label: "Defect Name", field: "Defect Name" },
];

function getValue(value: unknown): string {
    return String(value ?? "").trim() || "Unknown";
}

export function useDefectFilters(defects: Defect[]) {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get("category");
    const model = searchParams.get("model");
    const defectName = searchParams.get("defectName");

    const options = useMemo(() => ({
        category: [...new Set(defects.map(d => getValue(d["Defect Category"])))].sort(),
        model: [...new Set(defects.map(d => getValue(d["Car Model"])))].sort(),
        defectName: [...new Set(defects.map(d => getValue(d["Defect Name"])))].sort(),
    }), [defects]);

    const filteredDefects = useMemo(() => defects.filter(defect =>
        (category === null || getValue(defect["Defect Category"]) === category) &&
        (model === null || getValue(defect["Car Model"]) === model) &&
        (defectName === null || getValue(defect["Defect Name"]) === defectName)
    ), [defects, category, model, defectName]);

    function updateFilter(key: FilterKey, value: string) {
        const next = new URLSearchParams(searchParams);
        if (value === "") next.delete(key);
        else next.set(key, value);
        setSearchParams(next);
    }

    function clearAllFilters() {
        const next = new URLSearchParams(searchParams);
        FILTERS.forEach(({ key }) => next.delete(key));
        setSearchParams(next);
    }

    return {
        options,
        filteredDefects,
        selected: { category: category ?? "", model: model ?? "", defectName: defectName ?? "" },
        activeFilters: FILTERS.filter(({ key }) => searchParams.has(key)).length,
        updateFilter,
        clearAllFilters,
    };
}
