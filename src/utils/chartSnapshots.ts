
/**
 * Represents a saved snapshot of the defects-by-category chart.
 *
 * Stores the selected defect category, report count, dashboard date range,
 * engineering observation, and snapshot metadata.
 *
 * @property id - Unique identifier used to update or delete the snapshot.
 * @property chartId - Identifier of the source chart.
 * @property category - Defect category selected when the snapshot was created.
 * @property dateFrom - Start date of the selected dashboard date range.
 * @property dateTo - End date of the selected dashboard date range.
 * @property reportCount - Number of defect reports in the selected category.
 * @property note - Engineering observation associated with the snapshot.
 * @property createdAt - ISO timestamp indicating when the snapshot was created.
 */
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

// Browser storage key used to persist chart snapshots.
// The version suffix distinguishes this storage format from future revisions.
const STORAGE_KEY = "bmw-chart-snapshots-v1";

/**
 * Retrieves all saved chart snapshots from browser local storage.
 *
 * Parses the stored JSON and returns it as an array of ChartSnapshot
 * objects when the parsed value is an array.
 *
 * Returns an empty array when no snapshots exist, the stored JSON
 * is invalid, or browser storage cannot be accessed.
 *
 * @returns The stored chart snapshots, or an empty array if unavailable.
 */
export function getChartSnapshots(): ChartSnapshot[] {
    try {
        // Read and parse the stored snapshots, defaulting to an empty array.
        const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

        // Ensure the parsed top-level value is an array before returning it.
        return Array.isArray(stored) ? stored as ChartSnapshot[] : [];
    } catch {
        // Handle malformed JSON or browser storage access errors.
        return [];
    }
}

/**
 * Saves a new chart snapshot to browser local storage.
 *
 * Prepends the new snapshot to the existing collection so that
 * recently saved snapshots appear first when retrieved.
 *
 * @param snapshot - Complete chart snapshot to persist.
 * @throws If browser storage cannot be written.
 */
export function saveChartSnapshot(snapshot: ChartSnapshot): void {
    // Preserve existing snapshots while placing the newest entry first.
    localStorage.setItem(STORAGE_KEY, JSON.stringify([snapshot, ...getChartSnapshots()]));
}

/**
 * Updates the engineering observation associated with a saved snapshot.
 *
 * Finds the snapshot by its unique identifier and replaces only its
 * note field, preserving all other snapshot properties.
 *
 * If no snapshot matches the identifier, the existing collection
 * is written back without changes to its entries.
 *
 * @param id - Unique identifier of the snapshot to update.
 * @param note - New engineering observation to store.
 * @throws If browser storage cannot be written.
 */
export function updateChartSnapshotNote(id: string, note: string): void {
    // Create an updated collection without mutating the existing snapshots.
    const snapshots = getChartSnapshots().map(snapshot =>
        snapshot.id === id ? { ...snapshot, note } : snapshot
    );

    // Persist the updated collection to browser local storage.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

/**
 * Deletes a saved chart snapshot using its unique identifier.
 *
 * Removes the matching snapshot from the stored collection while
 * preserving all other snapshots and their original ordering.
 *
 * If the identifier does not match an existing snapshot, no entries
 * are removed.
 *
 * @param id - Unique identifier of the snapshot to delete.
 * @throws If browser storage cannot be written.
 */
export function deleteChartSnapshot(id: string): void {
    // Keep all snapshots except the one matching the requested identifier.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(
        getChartSnapshots().filter(snapshot => snapshot.id !== id)
    ));
}