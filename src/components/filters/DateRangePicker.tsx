
import { CalendarDays, ArrowRight } from "lucide-react";
import { useDateRange } from "../../context/DateRangeContext";

export default function DateRangePicker() {
    const { dateRange, setDateRange } = useDateRange();

    return (
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#1b1c25] px-4 py-2.5">
            <CalendarDays
                size={18}
                className="shrink-0 text-violet-400"
            />

            <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Production Period
        </span>

                <div className="flex items-center gap-2">
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

                    <ArrowRight size={14} className="shrink-0 text-zinc-600" />

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
