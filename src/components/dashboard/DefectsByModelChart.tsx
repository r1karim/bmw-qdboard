import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from "recharts";
import { useNavigate } from "react-router";

/**
 * Represents the vehicle model information required for the chart.
 *
 * @property "Car Model" - Vehicle model associated with a defect report.
 */
type Defect = {
    "Car Model": string;
};

/**
 * Props for the defects-by-model chart.
 *
 * @property defects - Defect reports used to calculate counts per car model.
 */
type Props = {
    defects: Defect[];
};

/**
 * Displays the number of defect reports associated with each car model.
 *
 * Groups defect reports by vehicle model, counts their occurrences,
 * and sorts the results from highest to lowest frequency.
 *
 * Clicking a bar navigates to the Defect Explorer with the selected
 * car model applied as a URL-based filter.
 *
 * @param defects - Defect reports to aggregate and visualize.
 */
export default function DefectsByModelChart({ defects }: Props) {
    // Enable navigation to the Defect Explorer when a chart bar is clicked.
    const navigate = useNavigate();

    // Count defect reports by car model, grouping missing names as "Unknown".
    const counts = defects.reduce<Record<string, number>>(
        (acc, defect) => {
            const model = defect["Car Model"]?.trim() || "Unknown";
            acc[model] = (acc[model] || 0) + 1;
            return acc;
        },
        {}
    );

    // Convert the grouped counts into chart data, ranked by frequency.
    const data = Object.entries(counts)
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="flex h-80 min-w-0 flex-col rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart heading. */}
            <h3 className="mb-1 text-sm font-semibold text-white">
                Defect Reports by Car Model
            </h3>

            {/* Describe the metric represented by the bars. */}
            <p className="mb-4 text-xs text-zinc-500">
                Number of reported defects per vehicle model
            </p>

            <div className="min-h-0 flex-1">
                {/* Automatically size the chart to the available container space. */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        {/* Display horizontal grid lines for comparing report counts. */}
                        <CartesianGrid stroke="#292a35" vertical={false} />

                        {/* Display vehicle model names along the horizontal axis. */}
                        <XAxis
                            dataKey="model"
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />

                        {/* Display the number of defect reports on the vertical axis. */}
                        <YAxis
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />

                        {/* Show report details when hovering over a chart bar. */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1e29",
                                border: "1px solid #383846",
                                borderRadius: 8,
                                color: "#fff",
                            }}
                        />

                        {/* Render clickable bars for each vehicle model. */}
                        <Bar
                            dataKey="count"
                            fill="#8b5cf6"
                            radius={[5, 5, 0, 0]}
                            cursor="pointer"
                            onClick={(entry) => {
                                // Read the selected model from the clicked chart entry.
                                const model = String(entry.payload?.model ?? "");
                                if (model) {
                                    // Pass the model as a URL parameter for table filtering.
                                    navigate(
                                        `/defects?model=${encodeURIComponent(model)}`
                                    );
                                }
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}