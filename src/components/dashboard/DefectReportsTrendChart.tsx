
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type TrendPoint = {
    date: string;
    count: number;
};

export default function DefectReportsTrendChart({
                                                    data,
                                                }: {
    data: TrendPoint[];
}) {
    return (
        <div className="h-80 min-w-0 rounded-xl border border-white/10 bg-[#191a22] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
                Defect Reports Over Time
            </h3>

            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="defectTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid stroke="#292a35" vertical={false} />

                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                            minTickGap={35}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1e29",
                                border: "1px solid #383846",
                                borderRadius: 8,
                            }}
                        />

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
