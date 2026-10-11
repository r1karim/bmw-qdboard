
import { useMemo } from "react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,} from "recharts";
import type { Defect } from "../../utils/dashboardAnalytics";

/**
 * Displays the average defect resolution time for each production station.
 *
 * Groups resolved defect reports by Station ID and calculates the mean
 * resolution time in hours for each station.
 *
 * Excludes unresolved reports and records with missing, invalid, or
 * negative resolution times. Stations are ranked from highest to
 * lowest average resolution time.
 *
 * @param defects - Defect reports from the selected date range.
 */
export default function ResolutionTimeByStationChart({defects,}: { defects: Defect[]; }) {
    // Recalculate station averages only when the input defect data changes.
    const data = useMemo(() => {
        // Store the total resolution hours and valid report count per station.
        const stations = new Map<
            string,
            { totalHours: number; count: number }
        >();

        for (const defect of defects) {
            // Only completed resolutions contribute to the station averages.
            if (defect["Resolution Status"] !== "Resolved") continue;

            const hours = defect["Resolution Time (hours)"];

            // Ignore missing or invalid resolution times
            if (
                hours === null ||
                hours === undefined ||
                !Number.isFinite(Number(hours)) ||
                Number(hours) < 0
            ) {
                continue;
            }

            // Group reports by station, using "Unknown" for missing station IDs.
            const station = defect["Station ID"] || 'Unknown';
            if (!stations.has(station)) {
                stations.set(station, { totalHours: 0, count: 0 });
            }

            // Accumulate the resolution time and report count for this station.
            const entry = stations.get(station)!;
            entry.totalHours += Number(hours);
            entry.count++;
        }

        // Calculate each station's mean resolution time and rank the results.
        return Array.from(stations, ([name, entry]) => ({
            name,
            averageHours: entry.totalHours / entry.count,
            count: entry.count,
        })).sort((a, b) => b.averageHours - a.averageHours);
    }, [defects]);

    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart heading and description. */}
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                    Average Resolution Time by Station
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Average hours to resolve a defect report
                </p>
            </div>

            {/* Display an empty state when no valid resolved reports are available. */}
            {data.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                    No resolved defects with valid resolution times.
                </div>
            ) : (
                <div className="h-[350px]">
                    {/* Resize the chart automatically to fit its container. */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 25, right: 10, left: 0, bottom: 10 }}
                        >
                            {/* Display horizontal grid lines for comparing resolution times. */}
                            <CartesianGrid
                                stroke="#292a35"
                                vertical={false}
                            />

                            {/* Display the production station identifiers. */}
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />

                            {/* Display average resolution time in hours. */}
                            <YAxis
                                type="number"
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                tickFormatter={(value) => `${value}h`}
                                axisLine={false}
                                tickLine={false}
                            />

                            {/* Show the station average and contributing report count on hover. */}
                            <Tooltip
                                formatter={(value, name, item) => {
                                    if (name === "averageHours") {
                                        return [
                                            `${Number(value).toFixed(1)} hours (${item.payload.count} reports)`,
                                            "Average resolution time",
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

                            {/* Render one bar for each station's average resolution time. */}
                            <Bar
                                dataKey="averageHours"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={36}
                            >
                                {/* Display average hours above each bar, rounded to one decimal. */}
                                <LabelList
                                    dataKey="averageHours"
                                    position="top"
                                    fill="#d4d4d8"
                                    fontSize={11}
                                    formatter={(value) => `${Number(value).toFixed(1)}h`}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Explain which defect reports contribute to the averages. */}
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Calculated using resolved defect reports with recorded
                resolution times. Unresolved reports and missing values
                are excluded.
            </p>
        </div>
    );
}
