import { useState } from "react";
import { useNavigate } from "react-router";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,} from "recharts";
import { useDateRange } from "../../context/DateRangeContext";
import { saveChartSnapshot } from "../../utils/chartSnapshots";

/**
 * Represents the defect category information required for the chart.
 *
 * @property "Defect Category" - Category assigned to a defect report.
 */
type Defect = {
    "Defect Category": string;
};

/**
 * Props for the defects-by-category chart.
 *
 * @property defects - Defect reports used to calculate category frequencies.
 */
type Props = {
    defects: Defect[];
};

/**
 * Represents an aggregated defect category selected from the chart.
 *
 * @property category - Name of the selected defect category.
 * @property count - Number of reports belonging to that category.
 */
type CategoryBar = {
    category: string;
    count: number;
};

/**
 * Displays defect report counts grouped by defect category.
 *
 * Aggregates reports by category and visualizes their frequencies
 * in a horizontal bar chart, ranked from highest to lowest.
 *
 * Selecting a bar opens a contextual menu that allows users to:
 * - Navigate to the Defect Explorer filtered by the selected category.
 * - Save a chart snapshot with the current date range, report count,
 *   and an engineering observation.
 *
 * @param defects - Defect reports to aggregate and visualize.
 */
export default function DefectsByCategoryChart({ defects }: Props) {
    // Access navigation and the globally selected dashboard date range.
    const navigate = useNavigate();
    const { dateRange } = useDateRange();

    // Manage the selected category, snapshot form, note, and save errors.
    const [selected, setSelected] = useState<CategoryBar | null>(null);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [note, setNote] = useState("");
    const [saveError, setSaveError] = useState("");

    // Count reports per defect category, grouping missing values as "Unknown".
    const counts = defects.reduce<Record<string, number>>(
        (acc, defect) => {
            const category = defect["Defect Category"]?.trim() || "Unknown";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        },
        {}
    );

    // Convert category counts into chart data, ordered by descending frequency.
    const data = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

    /**
     * Closes the category popup and resets its associated form state.
     *
     * Clears the selected category, snapshot note, and any previous
     * save error so the next interaction starts with a clean state.
     */
    function closePopup() {
        setSelected(null);
        setShowNoteForm(false);
        setNote("");
        setSaveError("");
    }

    /**
     * Saves a snapshot of the selected defect category.
     *
     * Requires both a selected category and a non-empty engineering note.
     * Records the category, report count, current date range, note,
     * unique identifier, and creation timestamp.
     *
     * Closes the popup after a successful save or displays an error
     * message if the snapshot cannot be saved.
     */
    function saveSnapshot() {
        // Prevent saving without a selected category or meaningful note.
        if (!selected || !note.trim()) return;

        try {
            // Persist the selected chart data and engineering observation.
            saveChartSnapshot({
                id: crypto.randomUUID(),
                chartId: "defects-by-category",
                category: selected.category,
                dateFrom: dateRange.start,
                dateTo: dateRange.end,
                reportCount: selected.count,
                note: note.trim(),
                createdAt: new Date().toISOString(),
            });
            closePopup();
        } catch {
            // Keep the form open and report failures to save the snapshot.
            setSaveError("Could not save the snapshot in this browser.");
        }
    }

    return (
        <div className="relative h-80 rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart heading. */}
            <h3 className="mb-4 text-sm font-semibold text-white">
                Defects by Defect Category
            </h3>

            {/* Render a responsive horizontal bar chart of category frequencies. */}
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 45, left: 10, bottom: 0 }}
                >
                    {/* Display vertical grid lines for comparing report counts. */}
                    <CartesianGrid
                        stroke="#292a35"
                        horizontal={false}
                    />

                    {/* Use a numeric count axis without displaying its labels. */}
                    <XAxis type="number" hide />

                    {/* Display defect category names along the vertical axis. */}
                    <YAxis
                        type="category"
                        dataKey="category"
                        width={95}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    />

                    {/* Show category details when hovering over a chart bar. */}
                    <Tooltip
                        cursor={{ fill: "#ffffff08" }}
                        contentStyle={{
                            backgroundColor: "#1e1e29",
                            border: "1px solid #383846",
                            borderRadius: 8,
                            color: "#fff",
                        }}
                    />

                    {/* Open the category action menu when a bar is selected. */}
                    <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                        barSize={17}
                        cursor="pointer"
                        onClick={(entry) => {
                            const category = entry?.payload?.category;
                            const count = entry?.payload?.count;

                            // Only open the popup when the chart entry is valid.
                            if (typeof category === "string" && typeof count === "number") {
                                setSelected({ category, count });
                                setShowNoteForm(false);
                                setNote("");
                                setSaveError("");
                            }
                        }}
                    >
                        {/* Display formatted report counts at the end of each bar. */}
                        <LabelList
                            dataKey="count"
                            position="right"
                            fill="#d4d4d8"
                            fontSize={11}
                            formatter={(value) => Number(value).toLocaleString()}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Show category actions or the snapshot form for the selected bar. */}
            {selected && (
                <div className="absolute right-3 top-12 z-20 w-72 max-w-[calc(100%-1.5rem)] rounded-xl border border-white/10 bg-[#252631] p-4 shadow-2xl">
                    {/* Display the selected category and its report count. */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-white">{selected.category}</p>
                            <p className="mt-1 text-xs text-zinc-400">
                                {selected.count.toLocaleString()} reports
                            </p>
                        </div>
                        <button type="button" onClick={closePopup} aria-label="Close menu" className="text-zinc-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    {/* Switch between category actions and the snapshot note form. */}
                    {!showNoteForm ? (
                        <div className="space-y-2">
                            {/* Navigate to defect records filtered by this category. */}
                            <button
                                type="button"
                                onClick={() => navigate(`/defects?category=${encodeURIComponent(selected.category)}`)}
                                className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                            >
                                Check Defects
                            </button>
                            {/* Open the form for recording an engineering observation. */}
                            <button
                                type="button"
                                onClick={() => setShowNoteForm(true)}
                                className="w-full rounded-lg bg-violet-600 px-3 py-2 text-left text-sm text-white hover:bg-violet-500"
                            >
                                Take Snapshot
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Show the date range and report count included in the snapshot. */}
                            <p className="text-xs text-zinc-400">
                                {dateRange.start} to {dateRange.end} · {selected.count.toLocaleString()} reports
                            </p>
                            {/* Capture the engineer's observation for the selected category. */}
                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Add an engineering observation..."
                                rows={4}
                                aria-label="Snapshot note"
                                className="w-full resize-none rounded-lg border border-white/10 bg-[#191a22] p-2 text-sm text-white outline-none focus:border-violet-500"
                            />
                            {/* Display a message if snapshot persistence fails. */}
                            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                            <div className="flex justify-end gap-2">
                                {/* Return to the category action menu without saving. */}
                                <button type="button" onClick={() => setShowNoteForm(false)} className="rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-white/10">
                                    Back
                                </button>
                                {/* Require a non-empty note before enabling snapshot saving. */}
                                <button type="button" onClick={saveSnapshot} disabled={!note.trim()} className="rounded-lg bg-violet-600 px-3 py-2 text-xs text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
                                    Save Snapshot
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}