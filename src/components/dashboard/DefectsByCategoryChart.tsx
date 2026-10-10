import { useNavigate } from "react-router";
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

type Defect = {
    "Defect Category": string;
};

type Props = {
    defects: Defect[];
};

export default function DefectsByCategoryChart({ defects }: Props) {
    const navigate = useNavigate();
    const counts = defects.reduce<Record<string, number>>(
        (acc, defect) => {
            const category = defect["Defect Category"]?.trim() || "Unknown";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        },
        {}
    );

    const data = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="h-80 rounded-xl border border-white/10 bg-[#191a22] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
                Defects by Defect Category
            </h3>

            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 45, left: 10, bottom: 0 }}
                >
                    <CartesianGrid
                        stroke="#292a35"
                        horizontal={false}
                    />

                    <XAxis type="number" hide />

                    <YAxis
                        type="category"
                        dataKey="category"
                        width={95}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    />

                    <Tooltip
                        cursor={{ fill: "#ffffff08" }}
                        contentStyle={{
                            backgroundColor: "#1e1e29",
                            border: "1px solid #383846",
                            borderRadius: 8,
                            color: "#fff",
                        }}
                    />

                    <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                        barSize={17}
                        cursor="pointer"
                        onClick={(entry) => {
                            const category = entry?.category;
                            if (typeof category === "string") {
                                navigate(`/defects?category=${encodeURIComponent(category)}`);
                            }
                        }}
                    >
                        <LabelList
                            dataKey="count"
                            position="right"
                            fill="#d4d4d8"
                            fontSize={11}
                            formatter={(value) => Number(value).toLocaleString()}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}