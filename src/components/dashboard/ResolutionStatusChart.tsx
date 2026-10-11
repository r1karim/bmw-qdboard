import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

/**
 * Represents a resolution status category in the chart.
 *
 * @property name - Resolution status label, such as Resolved or Open.
 * @property value - Number of defect reports with this status.
 * @property color - Color used to represent the status in the chart.
 */
type StatusData = {
    name: string;
    value: number;
    color: string;
};

/**
 * Props for the resolution status chart.
 *
 * @property data - Resolution status categories and their report counts.
 */
type Props = {
    data: StatusData[];
};

/**
 * Displays the distribution of defect reports by resolution status.
 *
 * Uses a Recharts doughnut chart to visualize the number of reports
 * in each status category, with distinct colors and a legend.
 *
 * The chart receives pre-aggregated status data from its parent
 * component rather than calculating the distribution itself.
 *
 * @param data - Resolution status categories, counts, and colors.
 */
export default function ResolutionStatusChart({ data }: Props) {
    return (
        <div className="h-80 rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart title. */}
            <h3 className="text-sm font-semibold text-white">
                Resolution Status
            </h3>

            {/* Explain the distribution shown in the chart. */}
            <p className="mt-1 text-xs text-zinc-500">
                Distribution of defect reports by status
            </p>

            <div className="h-60">
                {/* Automatically scale the chart to its container. */}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        {/* Render a doughnut chart using the supplied status counts. */}
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                        >
                            {/* Apply the configured color to each status category. */}
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>

                        {/* Display status details when hovering over chart segments. */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1e29",
                                border: "1px solid #383846",
                                borderRadius: 8,
                                color: "#fff",
                            }}
                        />

                        {/* Identify each resolution status using a chart legend. */}
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}