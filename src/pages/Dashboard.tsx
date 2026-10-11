import { ClipboardList, CarFront, Clock3, Factory, Percent,CheckCircle2  } from "lucide-react";
import KpiCard from "../components/dashboard/KpiCard";
import DefectsByModelChart from "../components/dashboard/DefectsByModelChart";
import ResolutionStatusChart from "../components/dashboard/ResolutionStatusChart";
import DefectsByCategoryChart from "../components/dashboard/DefectsByCategoryChart";
import DefectReportsTrendChart from "../components/dashboard/DefectReportsTrendChart";
import DefectReportShareChart from "../components/dashboard/DefectReportShareChart.tsx";
import ResolutionTimeByStationChart from "../components/dashboard/ResolutionTimeByStationChart";
import TopFiveDefectsChart from "../components/dashboard/TopFiveDefectsChart";
import SeverityDistributionChart from "../components/dashboard/SeverityDistributionChart";
import { useDefects } from "../context/DefectsContext";
import { useDateRange } from "../context/DateRangeContext";
import {filterByDate, countBy, createTrendData, estimateProduction,} from "../utils/dashboardAnalytics";

// Maps each resolution status to its corresponding chart color.
const statusColors: Record<string, string> = {
    Resolved: "#8b5cf6",
    "In Progress": "#f59e0b",
    Open: "#ef4444",
};


/**
 * Main dashboard page displaying production quality KPIs and charts.
 *
 * Retrieves defect records and the globally selected date range,
 * calculates summary metrics, and prepares data for visualizations.
 *
 * All dashboard metrics and charts reflect the selected date range.
 */
export default function Dashboard() {
    // Access the shared defect dataset and its loading/error states.
    const { defects, loading, error } = useDefects();

    // Access the production period selected in the global date filter.
    const { dateRange } = useDateRange();


    // Restrict dashboard calculations to reports within the selected period.
    const filteredDefects = filterByDate(
        defects,
        dateRange.start,
        dateRange.end
    );

    // Total number of defect reports in the selected period.
    const totalDefects = filteredDefects.length;

    // Count distinct VINs to determine how many vehicles are affected.
    // A vehicle with multiple defect reports is counted only once.
    const affectedVehicles = new Set(
        filteredDefects.map((defect) => defect.VIN).filter(Boolean)
    ).size;

    // Group reports by resolution status.
    const statusCounts = countBy(
        filteredDefects,
        "Resolution Status"
    );

    // Unresolved reports include both Open and In Progress statuses.
    const unresolvedReports =
        (statusCounts["Open"] || 0) +
        (statusCounts["In Progress"] || 0);

    const resolvedReports = statusCounts["Resolved"] || 0;

    // Convert status counts into the format expected by the status chart.
    // Use a fallback color for any status not defined in statusColors.
    const statusData = Object.entries(statusCounts).map(
        ([name, value]) => ({
            name,
            value,
            color: statusColors[name] || "#71717a",
        })
    );

    // Generate time-series data for the defect reporting trend chart.
    const trendData = createTrendData(
        filteredDefects,
        dateRange.start,
        dateRange.end
    );


    // Estimate production for the currently selected dashboard date range.
    const estimatedProduction = estimateProduction(
        dateRange.start,
        dateRange.end
    );

    // Calculate the estimated defective vehicle rate using unique affected VINs.
    const defectiveVehicleRate = estimatedProduction > 0
        ? (affectedVehicles / estimatedProduction) * 100
        : 0;

    // Display feedback while the dataset is loading or if loading fails.
    if (loading) return <p className="text-gray-400">Loading dashboard...</p>;
    if (error) return <p className="text-red-400">{error}</p>;

    return (
        <div className="w-full min-w-0 space-y-4">
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {/* KPI summary: three key production quality indicators. */}

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


                <KpiCard
                    title="Estimated Vehicles Produced"
                    value={estimatedProduction}
                    icon={Factory}
                    description="Approx. 300 vehicles per selected calendar day"
                />

                <KpiCard
                    title="Estimated Defective Vehicle Rate"
                    value={`${defectiveVehicleRate.toFixed(2)}%`}
                    icon={Percent}
                    description="Affected vehicles / estimated production"
                />

                <KpiCard
                    title="Resolved Reports"
                    value={resolvedReports}
                    icon={CheckCircle2 }
                    description="Total of resolved reports"
                />
            </section>

            {/* Responsive chart grid: two columns on extra-large screens. */}

            <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
                {/* Compare defect report counts across vehicle models. */}
                <div className="min-w-0">
                    <DefectsByModelChart defects={filteredDefects} />
                </div>

                {/* Visualize the distribution of resolution statuses. */}
                <div className="min-w-0">
                    <ResolutionStatusChart data={statusData} />
                </div>

                {/* Compare defect report counts across defect categories. */}
                <div className="min-w-0">
                    <DefectsByCategoryChart defects={filteredDefects} />
                </div>

                {/* Display how defect reporting changes over time. */}
                <div className="min-w-0">
                    <DefectReportsTrendChart data={trendData} />
                </div>

                {/* Show the relative share of defect reports. */}
                <div className="min-w-0">
                    <DefectReportShareChart defects={filteredDefects} />
                </div>

                {/* Compare defect resolution times between production stations. */}
                <div className="min-w-0">
                    <ResolutionTimeByStationChart defects={filteredDefects} />
                </div>

                {/* Highlight the five most frequently reported defects.
                    This chart spans both columns on extra-large screens. */}
                <div className="min-w-0">
                    <TopFiveDefectsChart defects={filteredDefects} />
                </div>
                <div className="min-w-0">
                    <SeverityDistributionChart defects={filteredDefects} />
                </div>
            </section>

        </div>
    );
}
