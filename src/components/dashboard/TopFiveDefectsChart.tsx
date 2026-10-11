import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { useNavigate } from "react-router";
import type { Defect } from "../../utils/dashboardAnalytics";

/**
 * Displays the five most frequently reported defect types.
 *
 * Groups defect reports by name, counts their occurrences, and
 * displays the five highest counts in a horizontal bar chart.
 *
 * Clicking a bar navigates to the Defect Explorer with the
 * corresponding defect name applied as a URL-based filter.
 *
 * @param defects - Defect reports from the selected date range.
 */
export default function TopFiveDefectsChart({defects,}: { defects: Defect[]; }) {
    // Enable navigation from chart bars to the filtered Defect Explorer.
    const navigate = useNavigate();

    // Calculate defect frequencies only when the input dataset changes.
    const data = useMemo(() => {
        const counts = new Map<string, number>();

        // Count reports by defect name, grouping missing names as "Unknown".
        for (const defect of defects) {
            const name = defect["Defect Name"]?.trim() || "Unknown";
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }

        // Sort by frequency and retain only the five most common defects.
        return Array.from(counts, ([name, count]) => ({
            name,
            count,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [defects]);

    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart title and description. */}
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                    Top 5 Most Frequent Defects
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Defect types ranked by number of reports
                </p>
            </div>

            {/* Display an empty state when no reports are available. */}
            {data.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">
                    No defect reports in the selected period.
                </div>
            ) : (
                <div className="h-[280px]">
                    {/* Automatically resize the chart to fit its container. */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 55, left: 20, bottom: 5 }}
                        >
                            {/* Show vertical grid lines to aid count comparisons. */}
                            <CartesianGrid
                                stroke="#292a35"
                                horizontal={false}
                            />

                            {/* Horizontal axis showing whole-number report counts. */}
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            {/* Vertical axis showing defect names. */}
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={145}
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            {/* Display formatted report counts when hovering over a bar. */}
                            <Tooltip
                                formatter={(value) => [
                                    Number(value).toLocaleString(),
                                    "Defect reports",
                                ]}
                                contentStyle={{
                                    backgroundColor: "#1e1e29",
                                    border: "1px solid #383846",
                                    borderRadius: 8,
                                    color: "#fff",
                                }}
                            />

                            {/* Render clickable bars for the five most frequent defect types. */}
                            <Bar
                                dataKey="count"
                                fill="#8b5cf6"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                                cursor="pointer"
                                onClick={(entry) => {
                                    const defectName = String(entry.name ?? "");

                                    // Pass the selected defect name as a URL query parameter.
                                    if (defectName) {
                                        navigate(
                                            `/defects?defectName=${encodeURIComponent(defectName)}`
                                        );
                                    }
                                }}
                            >
                                {/* Display the exact report count at the end of each bar. */}
                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    fill="#d4d4d8"
                                    fontSize={11}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Explain how defect frequencies are calculated. */}
            <p className="mt-4 text-xs text-zinc-500">
                Ranked by the number of defect reports in the selected
                date range. Each report is counted once.
            </p>
        </div>
    );
}