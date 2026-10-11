
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { DefectRow } from "../defects/tableConfig";

type Props = {
    defect: DefectRow;
};

export default function AIInvestigation({ defect }: Props) {
    const [suggestions, setSuggestions] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const defectId = String(defect["Defect ID"] ?? "");

    useEffect(() => {
        setSuggestions("");
        setError("");
        setLoading(false);
    }, [defectId]);

    async function generateSuggestions() {
        setLoading(true);
        setError("");
        setSuggestions("");

        try {
            const response = await fetch("/api/investigate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    defect_id: defectId,
                    defect_name: String(defect["Defect Name"] ?? ""),
                    category: String(defect["Defect Category"] ?? ""),
                    station: String(defect["Station Name"] ?? ""),
                    car_model: String(defect["Car Model"] ?? ""),
                    severity: Number(defect["Severity Rating"]),
                    resolution_status: String(
                        defect["Resolution Status"] ?? ""
                    ),
                    report_date: String(defect["Report Date"] ?? ""),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate suggestions");
            }

            const data: { suggestions: string } = await response.json();
            setSuggestions(data.suggestions);
        } catch {
            setError("Could not generate AI suggestions. Check that FastAPI is running.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white">
                    AI Investigation Suggestions
                </h3>
            </div>

            <p className="text-xs text-zinc-400">
                Generate three suggested investigation steps based on
                this defect report.
            </p>

            <button
                type="button"
                onClick={generateSuggestions}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-600/20 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-600/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Sparkles size={15} />
                {loading ? "Generating..." : "Generate AI Suggestions"}
            </button>

            {error && (
                <p role="alert" className="text-xs text-red-400">
                    {error}
                </p>
            )}

            {suggestions && (
                <div className="space-y-3 rounded-lg border border-white/10 bg-[#252631] p-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                        {suggestions}
                    </p>

                    <p className="border-t border-white/10 pt-3 text-xs text-zinc-500">
                        AI-generated suggestions are not confirmed findings.
                        An engineer should verify them before taking action.
                    </p>
                </div>
            )}
        </div>
    );
}