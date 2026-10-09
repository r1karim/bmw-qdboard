import type {
    OutlierItem,
    OutlierMetric,
} from "../../utils/outlierAnalytics";

type Props = {
    flagged: OutlierItem[];
    metric: OutlierMetric;
    threshold: number;
};

export default function OutlierResultsTable({
                                                flagged,
                                                metric,
                                                threshold,
                                            }: Props) {
    const isDaily = metric === "daily";
    const unit =
        metric === "resolution"
            ? "hours"
            : metric === "rework"
                ? "minutes"
                : "reports";

    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">
                    Flagged Outliers
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                    Showing the 10 highest values out of {flagged.length} flagged{" "}
                    {isDaily ? "days" : "defect reports"}.
                </p>
            </div>

            {flagged.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                    No outliers detected at the current sensitivity.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 text-gray-400">
                        <tr>
                            {isDaily ? (
                                <th className="pb-3 pr-5 font-medium">Date</th>
                            ) : (
                                <>
                                    <th className="pb-3 pr-5 font-medium">Defect ID</th>
                                    <th className="pb-3 pr-5 font-medium">VIN</th>
                                    <th className="pb-3 pr-5 font-medium">Station</th>
                                    <th className="pb-3 pr-5 font-medium">Date</th>
                                </>
                            )}

                            <th className="pb-3 pr-5 font-medium">Value</th>
                            <th className="pb-3 font-medium">Why flagged?</th>
                        </tr>
                        </thead>

                        <tbody>
                        {flagged.slice(0, 10).map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-white/5 last:border-0"
                            >
                                {isDaily ? (
                                    <td className="py-3 pr-5 text-white">
                                        {item.date}
                                    </td>
                                ) : (
                                    <>
                                        <td className="py-3 pr-5 text-white">
                                            {item.id}
                                        </td>
                                        <td className="py-3 pr-5 text-gray-300">
                                            {item.vin}
                                        </td>
                                        <td className="py-3 pr-5 text-gray-300">
                                            {item.station}
                                        </td>
                                        <td className="py-3 pr-5 text-gray-300">
                                            {item.date}
                                        </td>
                                    </>
                                )}

                                <td className="py-3 pr-5 font-medium text-violet-400">
                                    {item.value.toFixed(2)}
                                </td>

                                <td className="py-3 text-gray-400">
                                    {item.value.toFixed(2)} {unit} exceeds the{" "}
                                    {threshold.toFixed(2)} {unit} threshold.
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}