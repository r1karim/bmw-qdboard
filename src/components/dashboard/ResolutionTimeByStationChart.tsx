import { useMemo } from "react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,} from "recharts";
import type { Defect } from "../../utils/dashboardAnalytics";

export default function ResolutionTimeByStationChart({defects,}: { defects: Defect[]; }) {
    const data = useMemo(() => {
        const stations = new Map<
            string,
            { totalHours: number; count: number }
        >();

        for (const defect of defects) {
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

            const station = defect["Station ID"] || 'Unknown';
            if (!stations.has(station)) {
                stations.set(station, { totalHours: 0, count: 0 });
            }

            const entry = stations.get(station)!;
            entry.totalHours += Number(hours);
            entry.count++;
        }

        return Array.from(stations, ([name, entry]) => ({
            name,
            averageHours: entry.totalHours / entry.count,
            count: entry.count,
        })).sort((a, b) => b.averageHours - a.averageHours);
    }, [defects]);

    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                    Average Resolution Time by Station
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Average hours to resolve a defect report
                </p>
            </div>

            {data.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                    No resolved defects with valid resolution times.
                </div>
            ) : (
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 25, right: 10, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid
                                stroke="#292a35"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="name"
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />

                            <YAxis
                                type="number"
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                tickFormatter={(value) => `${value}h`}
                                axisLine={false}
                                tickLine={false}
                            />

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

                            <Bar
                                dataKey="averageHours"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={36}
                            >
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

            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Calculated using resolved defect reports with recorded
                resolution times. Unresolved reports and missing values
                are excluded.
            </p>
        </div>
    );
}