import {AreaChart, Area,XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from "recharts";

/**
 * Represents a single data point in the defect report trend.
 *
 * @property date - Date associated with the defect reports.
 * @property count - Number of defect reports recorded on that date.
 */
type TrendPoint = {
    date: string;
    count: number;
};

/**
 * Displays the number of defect reports over time.
 *
 * Uses a Recharts area chart to visualize changes in defect report
 * frequency across the supplied dates.
 *
 * The component receives pre-aggregated trend data from its parent,
 * keeping date grouping and report counting separate from presentation.
 *
 * @param data - Chronological data points containing dates and report counts.
 */
export default function DefectReportsTrendChart({
                                                    data,
                                                }: {
    data: TrendPoint[];
}) {
    return (
        <div className="h-80 min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart heading. */}
            <h3 className="mb-4 text-sm font-semibold text-white">
                Defect Reports Over Time
            </h3>

            <div className="h-[250px]">
                {/* Automatically resize the chart to fit the available container width. */}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        {/* Define the blue gradient used beneath the trend line. */}
                        <defs>
                            <linearGradient id="defectTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        {/* Display horizontal grid lines for comparing report counts. */}
                        <CartesianGrid stroke="#292a35" vertical={false} />

                        {/* Display report dates along the horizontal axis. */}
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                            minTickGap={35}
                        />

                        {/* Display whole-number defect report counts on the vertical axis. */}
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />

                        {/* Show report details when hovering over the trend. */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1e29",
                                border: "1px solid #383846",
                                borderRadius: 8,
                            }}
                        />

                        {/* Render a smoothed trend line with a gradient-filled area. */}
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fill="url(#defectTrend)"
                            dot={false}
                            activeDot={{ r: 5 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}