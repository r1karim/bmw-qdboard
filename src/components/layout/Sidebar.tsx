import {
    LayoutDashboard,
    Table2,
    ScanSearch,
    ClipboardCheck,
    FileWarning,
    Settings2,
} from "lucide-react";
import { NavLink } from "react-router";

// Define the available workspace pages, their routes, and navigation icons.
const navigation = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "Defect Explorer", path: "/defects", icon: Table2 },
    { name: "Outlier Detection", path: "/outliers", icon: ScanSearch },
    { name: "Tracking", path: "/tracking", icon: ClipboardCheck },
    { name: "Anomalies", path: "/anomalies", icon: FileWarning },
];

/**
 * Renders the application's main sidebar navigation.
 *
 * Displays BMW QdBoard branding, navigation links to the main
 * dashboard pages, and a footer with workspace information.
 *
 * Uses React Router's NavLink to highlight the currently active page.
 * The sidebar is visible on large screens and hidden on smaller devices.
 */
export default function Sidebar() {
    return (
        // Fixed-width sidebar, displayed only on large screens and above.
        <aside className="hidden w-[218px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0e14] lg:flex">

            {/* Application branding and BMW logo. */}
            <div className="flex h-28 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
                <img
                    src="/BMW.svg.webp"
                    alt="BMW Logo"
                    className="h-12 w-12 shrink-0 object-contain"
                />

                <div>
                    <h1 className="text-xl font-bold tracking-wider text-white">
                        BMW
                    </h1>
                    <p className="mt-1 text-[9px] tracking-[0.12em] text-zinc-500">
                        QdBoard
                    </p>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 px-3 pt-6">
                <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
                    WORKSPACE
                </p>

                {/* Generate navigation links from the centralized route configuration. */}
                <div className="space-y-1">
                    {navigation.map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            // Match the overview route exactly to avoid highlighting it on other pages.
                            end={path === "/"}
                            // Apply violet highlighting to the active navigation link.
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-md px-3 py-3 text-xs font-medium transition-colors ${
                                    isActive
                                        ? "border-l-2 border-violet-500 bg-violet-500/10 text-violet-300"
                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={16} />
                            <span>{name}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-white/[0.07] p-4">
                {/* Placeholder for a future settings feature; currently not interactive. */}
                <div className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-zinc-400">
                    <Settings2 size={16} />
                    Settings (disabled)
                </div>

                {/* Workspace identification. */}
                <p className="mt-4 px-3 text-[10px] text-zinc-600">
                    QLab · BMW Debrecen
                </p>
            </div>

        </aside>
    );
}