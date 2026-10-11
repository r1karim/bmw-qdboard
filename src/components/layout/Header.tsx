import DateRangePicker from "../filters/DateRangePicker";

/**
 * Renders the shared application header.
 *
 * Displays the dashboard title, branch identification, and
 * the global date range picker used to filter dashboard data.
 *
 * The DateRangePicker accesses the shared date range state
 * through the DateRangeContext provided by MainLayout.
 */
export default function Header() {
    return (
        // Full-width header with consistent height and responsive horizontal padding.
        <header className="flex h-28 shrink-0 items-center justify-between border-b border-white/[0.07] px-6 lg:px-9">
            {/* Dashboard identification and branch information. */}
            <div>
                <p className="text-[10px] font-semibold tracking-widest text-violet-400">
                    QUALITY OPERATIONS / DEBRECEN BRANCH
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                    Quality Dashboard
                </h2>

            </div>


            {/* Global date range control shared across dashboard pages. */}
            <DateRangePicker />

        </header>
    );
}