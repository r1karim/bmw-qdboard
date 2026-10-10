import type { OutlierDefect, OutlierItem, OutlierResult } from "./types";
import { isUnresolved, makeResult } from "./shared";

export function detectVin(defects: OutlierDefect[], unresolvedOnly: boolean): OutlierResult {
    const counts = new Map<string, number>();
    for (const defect of defects) {
        const vin = defect.VIN?.trim();
        if (!vin) continue;
        counts.set(vin, (counts.get(vin) ?? 0) + 1);
    }

    const items: OutlierItem[] = Array.from(counts, ([vin, count]) => ({
        id: vin,
        label: vin,
        value: count,
        date: "",
        vin,
    })).sort((a, b) => b.value - a.value);

    const unresolvedVins = new Set(
        defects
            .filter((defect) => isUnresolved(defect["Resolution Status"]))
            .map((defect) => defect.VIN?.trim())
            .filter((vin): vin is string => Boolean(vin))
    );

    const flagged = items.filter(
        (item) => item.value > 1 &&
            (!unresolvedOnly || (item.vin !== undefined && unresolvedVins.has(item.vin)))
    );

    return makeResult("vin", items, flagged, 1);
}
