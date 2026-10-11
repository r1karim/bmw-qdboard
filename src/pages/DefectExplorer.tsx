import { useDefects } from "../context/DefectsContext";
import DefectsTable from "../components/defects/DefectsTable";

/**
 * Defect Explorer page for browsing BMW production quality records.
 *
 * Retrieves the shared defect dataset and passes it to DefectsTable,
 * which handles searching, filtering, sorting, pagination,
 * and defect investigation actions through MUI Data Grid.
 */
export default function DefectExplorer() {
    // Access defect records and their loading/error states from context.
    const { defects, loading, error } = useDefects();

    // Display appropriate feedback while loading or if data retrieval fails.
    if (loading) return <p className="text-gray-400">Loading defects...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    return (
        <div className="w-full min-w-0 space-y-5">
            <div>
                <p className="mt-1 text-sm text-zinc-500">
                    Search and sort BMW production quality records.
                </p>
            </div>
            <DefectsTable defects={defects} />
        </div>
    );
}
