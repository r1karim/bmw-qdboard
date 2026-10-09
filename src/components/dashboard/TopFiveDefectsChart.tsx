
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

import type { Defect } from "../../utils/dashboardAnalytics";

export default function TopFiveDefectsChart({
                                                defects,
                                            }: {
    defects: Defect[];
}) {
    const data = useMemo(() => {
        const counts = new Map<string, number>();

        for (const defect of defects) {
            const name = defect["Defect Name"]?.trim() || "Unknown";
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }

        return Array.from(counts, ([name, count]) => ({
            name,
            count,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [defects]);

    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                    Top 5 Most Frequent Defects
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Defect types ranked by number of reports
                </p>
            </div>

            {data.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">
                    No defect reports in the selected period.
                </div>
            ) : (
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 55, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid
                                stroke="#292a35"
                                horizontal={false}
                            />

                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                type="category"
                                dataKey="name"
                                width={145}
                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />

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

                            <Bar
                                dataKey="count"
                                fill="#8b5cf6"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                            >
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

            <p className="mt-4 text-xs text-zinc-500">
                Ranked by the number of defect reports in the selected
                date range. Each report is counted once.
            </p>
        </div>
    );
}
