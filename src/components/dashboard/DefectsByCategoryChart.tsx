import { useState } from "react";
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
import { useDateRange } from "../../context/DateRangeContext";
import { saveChartSnapshot } from "../../utils/chartSnapshots";

type Defect = {
    "Defect Category": string;
};

type Props = {
    defects: Defect[];
};

type CategoryBar = {
    category: string;
    count: number;
};

export default function DefectsByCategoryChart({ defects }: Props) {
    const navigate = useNavigate();
    const { dateRange } = useDateRange();
    const [selected, setSelected] = useState<CategoryBar | null>(null);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [note, setNote] = useState("");
    const [saveError, setSaveError] = useState("");

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

    function closePopup() {
        setSelected(null);
        setShowNoteForm(false);
        setNote("");
        setSaveError("");
    }

    function saveSnapshot() {
        if (!selected || !note.trim()) return;

        try {
            saveChartSnapshot({
                id: crypto.randomUUID(),
                chartId: "defects-by-category",
                category: selected.category,
                dateFrom: dateRange.start,
                dateTo: dateRange.end,
                reportCount: selected.count,
                note: note.trim(),
                createdAt: new Date().toISOString(),
            });
            closePopup();
        } catch {
            setSaveError("Could not save the snapshot in this browser.");
        }
    }

    return (
        <div className="relative h-80 rounded-xl border border-white/10 bg-[#191a22] p-5">
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
                            const count = entry?.count;
                            if (typeof category === "string" && typeof count === "number") {
                                setSelected({ category, count });
                                setShowNoteForm(false);
                                setNote("");
                                setSaveError("");
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

            {selected && (
                <div className="absolute right-3 top-12 z-20 w-72 max-w-[calc(100%-1.5rem)] rounded-xl border border-white/10 bg-[#252631] p-4 shadow-2xl">
                    <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-white">{selected.category}</p>
                            <p className="mt-1 text-xs text-zinc-400">
                                {selected.count.toLocaleString()} reports
                            </p>
                        </div>
                        <button type="button" onClick={closePopup} aria-label="Close menu" className="text-zinc-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    {!showNoteForm ? (
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => navigate(`/defects?category=${encodeURIComponent(selected.category)}`)}
                                className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                            >
                                Check Defects
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNoteForm(true)}
                                className="w-full rounded-lg bg-violet-600 px-3 py-2 text-left text-sm text-white hover:bg-violet-500"
                            >
                                Take Snapshot
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-zinc-400">
                                {dateRange.start} to {dateRange.end} · {selected.count.toLocaleString()} reports
                            </p>
                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Add an engineering observation..."
                                rows={4}
                                aria-label="Snapshot note"
                                className="w-full resize-none rounded-lg border border-white/10 bg-[#191a22] p-2 text-sm text-white outline-none focus:border-violet-500"
                            />
                            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowNoteForm(false)} className="rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-white/10">
                                    Back
                                </button>
                                <button type="button" onClick={saveSnapshot} disabled={!note.trim()} className="rounded-lg bg-violet-600 px-3 py-2 text-xs text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
                                    Save Snapshot
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
