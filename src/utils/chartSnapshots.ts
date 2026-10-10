export type ChartSnapshot = {
    id: string;
    chartId: "defects-by-category";
    category: string;
    dateFrom: string;
    dateTo: string;
    reportCount: number;
    note: string;
    createdAt: string;
};

const STORAGE_KEY = "bmw-chart-snapshots-v1";

export function getChartSnapshots(): ChartSnapshot[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(stored) ? stored as ChartSnapshot[] : [];
    } catch {
        return [];
    }
}

export function saveChartSnapshot(snapshot: ChartSnapshot): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([snapshot, ...getChartSnapshots()]));
}

export function updateChartSnapshotNote(id: string, note: string): void {
    const snapshots = getChartSnapshots().map(snapshot =>
        snapshot.id === id ? { ...snapshot, note } : snapshot
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

export function deleteChartSnapshot(id: string): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(
        getChartSnapshots().filter(snapshot => snapshot.id !== id)
    ));
}
