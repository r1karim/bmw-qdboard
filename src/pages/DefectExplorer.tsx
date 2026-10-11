
import { useDefects } from "../context/DefectsContext";
import DefectsTable from "../components/defects/DefectsTable";

export default function DefectExplorer() {
    const { defects, loading, error } = useDefects();

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
