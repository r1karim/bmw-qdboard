
import { useEffect, useState } from "react";
import DefectsTable, {
    type DefectRow,
} from "../components/defects/DefectsTable";

export default function DefectExplorer() {
    const [defects, setDefects] = useState<DefectRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("/data/defects.json")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load defects");
                return response.json();
            })
            .then((data: DefectRow[]) => setDefects(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full min-w-0 space-y-5">
            <div>
                <p className="mt-1 text-sm text-zinc-500">
                    Search and sort BMW production quality records.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-400">Loading defects...</p>
            ) : error ? (
                <p className="text-sm text-red-400">
                    Failed to load defect records.
                </p>
            ) : (
                <DefectsTable defects={defects} />
            )}
        </div>
    );
}
