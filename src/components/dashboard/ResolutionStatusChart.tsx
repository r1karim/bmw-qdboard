
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

type StatusData = {
    name: string;
    value: number;
    color: string;
};

type Props = {
    data: StatusData[];
};

export default function ResolutionStatusChart({ data }: Props) {
    return (
        <div className="h-80 rounded-xl border border-white/10 bg-[#191a22] p-5">
            <h3 className="text-sm font-semibold text-white">
                Resolution Status
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
                Distribution of defect reports by status
            </p>

            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1e29",
                                border: "1px solid #383846",
                                borderRadius: 8,
                                color: "#fff",
                            }}
                        />

                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}