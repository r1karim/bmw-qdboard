import DateRangePicker from "../filters/DateRangePicker";

export default function Header() {
    return (
        <header className="flex h-28 shrink-0 items-center justify-between border-b border-white/[0.07] px-6 lg:px-9">
            <div>
                <p className="text-[10px] font-semibold tracking-widest text-violet-400">
                    QUALITY OPERATIONS / DEBRECEN BRANCH
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                    Quality Dashboard
                </h2>

            </div>


            <DateRangePicker />

        </header>
    );
}
