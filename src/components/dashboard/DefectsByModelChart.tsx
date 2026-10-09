
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type Defect = {
    "Car Model": string;
};

type Props = {
    defects: Defect[];
};

export default function DefectsByModelChart({ defects }: Props) {
    const counts = defects.reduce<Record<string, number>>(
        (acc, defect) => {
            const model = defect["Car Model"] || "Unknown";
            acc[model] = (acc[model] || 0) + 1;
            return acc;
        },
        {}
    );

    const data = Object.entries(counts)
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="flex h-80 min-w-0 flex-col rounded-xl border border-white/10 bg-[#191a22] p-5">
            <h3 className="mb-1 text-sm font-semibold text-white">
                Defect Reports by Car Model
            </h3>

            <p className="mb-4 text-xs text-zinc-500">
                Number of reported defects per vehicle model
            </p>

            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="#292a35" vertical={false} />

                        <XAxis
                            dataKey="model"
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />

                        <YAxis
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />

                        <Tooltip
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
                            radius={[5, 5, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
