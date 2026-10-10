import type { OutlierItem, OutlierMetric } from "../../utils/outlierAnalytics";

type Props = {
    flagged: OutlierItem[];
    metric: OutlierMetric;
    threshold: number;
};

export default function OutlierResultsTable({ flagged, metric, threshold }: Props) {
    const shown = flagged.slice(0, 10);
    const isVin = metric === "vin";
    const isSeverity = metric === "severity";

    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
            <h2 className="text-lg font-semibold text-white">Flagged Outliers</h2>
            <p className="mt-1 text-xs text-gray-400">
                Showing {shown.length} {isSeverity ? "most critical" : "highest"} values out of {flagged.length.toLocaleString()} flagged {isVin ? "VINs" : "defect reports"}.
            </p>
            <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-gray-400">
                    <tr>
                        <th className="pb-3 pr-4">{isVin ? "VIN" : "Defect ID"}</th>
                        {!isVin && <th className="pb-3 pr-4">VIN</th>}
                        {!isVin && <th className="pb-3 pr-4">Station</th>}
                        {!isVin && <th className="pb-3 pr-4">Date</th>}
                        <th className="pb-3 pr-4">{isSeverity ? "Severity Rating" : isVin ? "Report Count" : "Hours"}</th>
                        <th className="pb-3">Why flagged?</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shown.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 text-white">
                            <td className="py-3 pr-4">{item.label}</td>
                            {!isVin && <td className="py-3 pr-4">{item.vin ?? "—"}</td>}
                            {!isVin && <td className="py-3 pr-4">{item.station ?? "—"}</td>}
                            {!isVin && <td className="py-3 pr-4">{item.date}</td>}
                            <td className="py-3 pr-4 font-semibold text-violet-400">
                                {isSeverity || isVin ? item.value : item.value.toFixed(2)}
                            </td>
                            <td className="py-3 text-gray-400">
                                {isSeverity
                                    ? `Rating ${item.value} is ≤ ${threshold} (1 = most severe).`
                                    : isVin
                                        ? `${item.value} reports for this VIN (more than 1).`
                                        : `${item.value.toFixed(2)} hours exceeds the ${threshold.toFixed(2)}-hour threshold.`}
                            </td>
                        </tr>
                    ))}
                    {shown.length === 0 && (
                        <tr><td colSpan={6} className="py-6 text-center text-gray-400">No flagged observations.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

