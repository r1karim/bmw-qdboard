
import { useEffect, useState } from "react";
import { ClipboardList, CarFront, Clock3 } from "lucide-react";

import KpiCard from "../components/dashboard/KpiCard";
import DefectsByModelChart from "../components/dashboard/DefectsByModelChart";
import ResolutionStatusChart from "../components/dashboard/ResolutionStatusChart";
import DefectsByCategoryChart from "../components/dashboard/DefectsByCategoryChart";
import DefectReportsTrendChart from "../components/dashboard/DefectReportsTrendChart";
import DefectReportShareChart from "../components/dashboard/DefectReportShareChart.tsx";
import ResolutionTimeByStationChart from "../components/dashboard/ResolutionTimeByStationChart";
import TopFiveDefectsChart from "../components/dashboard/TopFiveDefectsChart";
import { useDateRange } from "../context/DateRangeContext";
import {
    filterByDate,
    countBy,
    createTrendData,
    type Defect,
} from "../utils/dashboardAnalytics";

const statusColors: Record<string, string> = {
    Resolved: "#8b5cf6",
    "In Progress": "#f59e0b",
    Open: "#ef4444",
};

export default function Dashboard() {
    const [defects, setDefects] = useState<Defect[]>([]);
    const { dateRange } = useDateRange();

    // Load the full dataset once
    useEffect(() => {
        fetch("/data/defects.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load defects");
                }
                return response.json();
            })
            .then((data: Defect[]) => setDefects(data))
            .catch(console.error);
    }, []);

    // Filter all records by the selected date range
    const filteredDefects = filterByDate(
        defects,
        dateRange.start,
        dateRange.end
    );

    // KPI calculations
    const totalDefects = filteredDefects.length;

    const affectedVehicles = new Set(
        filteredDefects.map((defect) => defect.VIN).filter(Boolean)
    ).size;

    const statusCounts = countBy(
        filteredDefects,
        "Resolution Status"
    );

    const unresolvedReports =
        (statusCounts["Open"] || 0) +
        (statusCounts["In Progress"] || 0);

    // Chart data
    const statusData = Object.entries(statusCounts).map(
        ([name, value]) => ({
            name,
            value,
            color: statusColors[name] || "#71717a",
        })
    );

    const trendData = createTrendData(
        filteredDefects,
        dateRange.start,
        dateRange.end
    );

    return (
        <div className="w-full min-w-0 space-y-4">
            {/* KPI cards */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard
                    title="Defect Reports"
                    value={totalDefects}
                    icon={ClipboardList}
                    description="Total reported quality defects"
                />

                <KpiCard
                    title="Affected Vehicles"
                    value={affectedVehicles}
                    icon={CarFront}
                    description="Unique vehicles with reported defects"
                />

                <KpiCard
                    title="Unresolved Reports"
                    value={unresolvedReports}
                    icon={Clock3}
                    description="Open and in-progress defect reports"
                />
            </section>

            <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">

                <div className="min-w-0">
                    <DefectsByModelChart defects={filteredDefects} />
                </div>

                <div className="min-w-0">
                    <ResolutionStatusChart data={statusData} />
                </div>

                <div className="min-w-0">
                    <DefectsByCategoryChart defects={filteredDefects} />
                </div>

                <div className="min-w-0">
                    <DefectReportsTrendChart data={trendData} />
                </div>

                <div className="min-w-0">
                    <DefectReportShareChart defects={filteredDefects} />
                </div>

                <div className="min-w-0">
                    <ResolutionTimeByStationChart defects={filteredDefects} />
                </div>

                <div className="min-w-0 xl:col-span-2">
                    <TopFiveDefectsChart defects={filteredDefects} />
                </div>

            </section>

        </div>
    );
}
