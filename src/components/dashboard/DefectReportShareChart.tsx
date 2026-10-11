import { useMemo, useState } from "react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList} from "recharts";

import type { Defect } from "../../utils/dashboardAnalytics";

/**
 * Defines the vehicle attributes available for grouping defect reports.
 *
 * Restricts the grouping selection to Car Model, Motor Type,
 * or Design Package.
 */
type GroupBy = "Car Model" | "Motor Type" | "Design Package";

/**
 * Displays the percentage distribution of defect reports by vehicle attribute.
 *
 * Allows users to group reports by Car Model, Motor Type, or Design Package.
 * Each group's percentage is calculated relative to the total number of
 * defect reports in the supplied dataset.
 *
 * Results are sorted by descending percentage and displayed in a
 * horizontal bar chart with report counts available in tooltips.
 *
 * @param defects - Defect reports from the selected date range.
 */
export default function DefectReportShareChart({defects}: { defects: Defect[]; }) {
    // Track the selected grouping attribute, defaulting to Car Model.
    const [groupBy, setGroupBy] = useState<GroupBy>("Car Model");

    // Recalculate report shares when the dataset or grouping attribute changes.
    const data = useMemo(() => {
        // Count reports for each distinct value of the selected vehicle attribute.
        const counts = new Map<string, number>();

        for (const defect of defects) {
            // Group missing or empty attribute values under "Unknown".
            const name = defect[groupBy]?.trim() || "Unknown";
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }

        // Use all supplied defect reports as the percentage denominator.
        const totalReports = defects.length;

        // Calculate percentage shares and rank groups from highest to lowest.
        return Array.from(counts, ([name, count]) => ({
            name,
            count,
            percentage: totalReports > 0
                ? (count / totalReports) * 100
                : 0,
        })).sort((a, b) => b.percentage - a.percentage);
    }, [defects, groupBy]);

    return (
        <div className="h-full min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                {/* Chart heading and metric description. */}
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        Defect Report Share (%)
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                        Percentage of all defect reports by vehicle attribute
                    </p>
                </div>

                {/* Allow users to change the attribute used to group reports. */}
                <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                    className="rounded-lg border border-white/10 bg-[#252631] px-3 py-2 text-xs text-white outline-none"
                >
                    <option value="Car Model">Car Model</option>
                    <option value="Motor Type">Motor Type</option>
                    <option value="Design Package">Design Package</option>
                </select>
            </div>

            {/* Display an empty state when the selected period has no reports. */}
            {data.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                    No defect reports in the selected period.
                </div>
            ) : (
                // Adjust chart height to accommodate the number of attribute groups.
                <div style={{ height: Math.max(220, data.length * 45) }}>
                    {/* Resize the chart to fit its container. */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 55, left: 10, bottom: 5 }}
                        >
                            {/* Display vertical grid lines for comparing percentages. */}
                            <CartesianGrid
                                stroke="#292a35"
                                horizontal={false}
                            />

                            {/* Display percentage shares on a fixed 0–100% scale. */}
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                            />

                            {/* Display the selected vehicle attribute values. */}
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={110}
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            {/* Show both percentage share and report count on hover. */}
                            <Tooltip
                                formatter={(value, name, item) => {
                                    if (name === "percentage") {
                                        return [
                                            `${Number(value).toFixed(1)}% (${item.payload.count} reports)`,
                                            "Report share",
                                        ];
                                    }

                                    return [value, name];
                                }}
                                contentStyle={{
                                    backgroundColor: "#1e1e29",
                                    border: "1px solid #383846",
                                    borderRadius: 8,
                                    color: "#fff",
                                }}
                            />

                            {/* Render each group's percentage as a horizontal bar. */}
                            <Bar
                                dataKey="percentage"
                                fill="#8b5cf6"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            >
                                {/* Display percentage values rounded to one decimal place. */}
                                <LabelList
                                    dataKey="percentage"
                                    position="right"
                                    fill="#d4d4d8"
                                    fontSize={11}
                                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Clarify the denominator and distinguish report share from vehicle defect rate. */}
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Denominator: all defect reports in the selected date range
                ({defects.length.toLocaleString()} reports).
                Percentages represent the share of reported defects, not
                the percentage of manufactured vehicles with defects.
            </p>
        </div>
    );
}
