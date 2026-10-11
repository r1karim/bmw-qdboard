
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { DefectRow } from "../defects/tableConfig";

/**
 * Props for the AI investigation assistant.
 */
type Props = {
    defect: DefectRow;
};

/**
 * Generates AI-assisted investigation suggestions for a defect report.
 *
 * Sends relevant defect information to the FastAPI backend and
 * displays the generated suggestions, loading state, or error message.
 *
 * Suggestions are advisory and must be verified by an engineer.
 *
 * @param defect - Defect report used to generate investigation suggestions.
 */
export default function AIInvestigation({ defect }: Props) {
    // Store generated suggestions and track request progress or errors.
    const [suggestions, setSuggestions] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Extract the unique identifier of the selected defect.
    const defectId = String(defect["Defect ID"] ?? "");

    // Reset previous suggestions and request states when the selected defect changes.
    useEffect(() => {
        setSuggestions("");
        setError("");
        setLoading(false);
    }, [defectId]);

    /**
     * Request AI-generated investigation suggestions from the backend.
     *
     * Sends selected defect attributes as JSON to the FastAPI endpoint
     * and updates the component state with the returned suggestions.
     * Displays an error message if the request fails.
     */
    async function generateSuggestions() {
        // Clear previous results and indicate that a request is in progress.
        setLoading(true);
        setError("");
        setSuggestions("");

        try {
            // Send relevant defect details to the investigation API.
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

            // Treat unsuccessful HTTP responses as request failures.
            if (!response.ok) {
                throw new Error("Failed to generate suggestions");
            }

            // Read the generated investigation suggestions from the response.
            const data: { suggestions: string } = await response.json();
            setSuggestions(data.suggestions);
        } catch {
            // Display a user-friendly message if the backend request fails.
            setError("Could not generate AI suggestions. Check that FastAPI is running.");
        } finally {
            // Restore the button after the request finishes.
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
            {/* Section heading identifying the AI investigation assistant. */}
            <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white">
                    AI Investigation Suggestions
                </h3>
            </div>

            {/* Explain what the AI assistant generates. */}
            <p className="text-xs text-zinc-400">
                Generate three suggested investigation steps based on
                this defect report.
            </p>

            {/* Trigger suggestion generation and prevent duplicate clicks while loading. */}
            <button
                type="button"
                onClick={generateSuggestions}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-600/20 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-600/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Sparkles size={15} />
                {loading ? "Generating..." : "Generate AI Suggestions"}
            </button>

            {/* Show an error message when the API request fails. */}
            {error && (
                <p role="alert" className="text-xs text-red-400">
                    {error}
                </p>
            )}

            {/* Display generated suggestions only when a response is available. */}
            {suggestions && (
                <div className="space-y-3 rounded-lg border border-white/10 bg-[#252631] p-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                        {suggestions}
                    </p>

                    {/* Remind engineers that AI output requires human verification. */}
                    <p className="border-t border-white/10 pt-3 text-xs text-zinc-500">
                        AI-generated suggestions are not confirmed findings.
                        An engineer should verify them before taking action.
                    </p>
                </div>
            )}
        </div>
    );
}