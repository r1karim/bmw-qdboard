import { useMemo } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";
import type { Defect } from "../../utils/dashboardAnalytics";

type Props = {
    defects: Defect[];
};

// Severity colors are preserved from the original chart.
const severityColors = [
    "#dc2626",
    "#ef4444",
    "#f97316",
    "#fb923c",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
];

/**
 * Displays the distribution of defect reports by severity rating.
 *
 * Receives defect reports filtered by the selected dashboard date range
 * and calculates the relative share of each valid severity level.
 *
 * Severity 1 is the most critical and severity 10 is the least critical.
 */
export default function SeverityDistributionChart({ defects }: Props) {
    const data = useMemo(() => {
        const counts = Array.from({ length: 10 }, () => 0);

        for (const defect of defects) {
            const rawSeverity = defect["Severity Rating"];

            if (
                rawSeverity === undefined ||
                rawSeverity === null ||
                String(rawSeverity).trim() === ""
            ) {
                continue;
            }

            const severity = Number(rawSeverity);

            if (
                !Number.isInteger(severity) ||
                severity < 1 ||
                severity > 10
            ) {
                continue;
            }

            counts[severity - 1]++;
        }

        return counts
            .map((count, index) => ({
                name: `Severity ${index + 1}`,
                severity: index + 1,
                value: count,
            }))
            .filter((item) => item.value > 0);
    }, [defects]);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Chart title and description, matching other dashboard charts. */}
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                    Defect Severity Distribution
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                    Share of defect reports by severity rating
                </p>
            </div>

            {/* Display an empty state when no valid severity data is available. */}
            {total === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-sm text-zinc-500">
                    No severity data in the selected period.
                </div>
            ) : (
                <div className="h-[280px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="43%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={2}
                                isAnimationActive={false}
                            >
                                {data.map((item) => (
                                    <Cell
                                        key={item.severity}
                                        fill={severityColors[item.severity - 1]}
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                formatter={(value, name) => {
                                    const count = Number(value);
                                    const percentage = (count / total) * 100;

                                    return [
                                        `${count} reports (${percentage.toFixed(1)}%)`,
                                        String(name),
                                    ];
                                }}
                                contentStyle={{
                                    backgroundColor: "#1e1e29",
                                    border: "1px solid #383846",
                                    borderRadius: 8,
                                    color: "#fff",
                                }}
                            />

                        </PieChart>
                    </ResponsiveContainer>


                    {/* Display severity levels in numeric order rather than string order. */}
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                        {[...data]
                            .sort((a, b) => a.severity - b.severity)
                            .map((item) => (
                                <div
                                    key={item.severity}
                                    className="flex items-center gap-1 text-[11px] text-zinc-400"
                                >
                <span
                    className="h-2 w-2 shrink-0"
                    style={{
                        backgroundColor: severityColors[item.severity - 1],
                    }}
                />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Explanation styled consistently with other chart footers. */}
            <p className="mt-4 text-xs text-zinc-500">
                Based on {total.toLocaleString()} reports with valid severity
                ratings in the selected date range. Severity 1 is most critical;
                severity 10 is least critical.
            </p>
        </div>
    );
}
