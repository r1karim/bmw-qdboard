import { CalendarDays, ArrowRight } from "lucide-react";
import { useDateRange } from "../../context/DateRangeContext";

/**
 * Renders the global production date range selector.
 *
 * Allows users to select a start and end date for filtering
 * dashboard data across the application.
 *
 * Reads and updates the shared date range through DateRangeContext.
 * Native date input constraints prevent selecting a start date
 * after the end date or an end date before the start date.
 */
export default function DateRangePicker() {
    // Access the globally selected date range and its update function.
    const { dateRange, setDateRange } = useDateRange();

    return (
        // Container for the production period controls.
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#1b1c25] px-4 py-2.5">
            {/* Calendar icon identifying the date filtering controls. */}
            <CalendarDays
                size={18}
                className="shrink-0 text-violet-400"
            />

            <div className="flex flex-col gap-1">
                {/* Label describing the selected production period. */}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Production Period
        </span>

                <div className="flex items-center gap-2">
                    {/* Start date cannot be later than the currently selected end date. */}
                    <input
                        type="date"
                        aria-label="Start date"
                        value={dateRange.start}
                        max={dateRange.end}
                        onChange={(e) =>
                            setDateRange({ ...dateRange, start: e.target.value })
                        }
                        className="w-[115px] bg-transparent text-xs font-medium text-white outline-none scheme-dark"
                    />

                    {/* Visually separate the start and end dates. */}
                    <ArrowRight size={14} className="shrink-0 text-zinc-600" />

                    {/* End date cannot be earlier than the currently selected start date. */}
                    <input
                        type="date"
                        aria-label="End date"
                        value={dateRange.end}
                        min={dateRange.start}
                        onChange={(e) =>
                            setDateRange({ ...dateRange, end: e.target.value })
                        }
                        className="w-[115px] bg-transparent text-xs font-medium text-white outline-none scheme-dark"
                    />
                </div>
            </div>
        </div>
    );
}