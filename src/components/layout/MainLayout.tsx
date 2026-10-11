import type { ReactNode } from "react";
import { DateRangeProvider } from "../../context/DateRangeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * Props for the main application layout.
 *
 * @property children - Page content rendered inside the shared layout.
 */
interface MainLayoutProps {
    children: ReactNode;
}

/**
 * Provides the shared layout structure for the application.
 *
 * Wraps the application pages in DateRangeProvider so the header
 * and page components can access the same global date range.
 *
 * Displays the sidebar, header, and active page content within
 * a responsive layout with a vertically scrollable main area.
 *
 * @param children - Content of the currently rendered page.
 */
export default function MainLayout({ children }: MainLayoutProps) {
    return (
        // Share the selected date range across the header and page content.
        <DateRangeProvider>
            {/* Full-height application container with a desktop flex layout. */}
            <div className="h-screen overflow-hidden bg-[#101116] text-zinc-100 lg:flex">
                {/* Persistent navigation sidebar on large screens. */}
                <Sidebar />

                {/* Scrollable content area containing the header and active page. */}
                <main className="min-w-0 flex-1 overflow-y-auto">
                    <Header />
                    {/* Center page content and limit its maximum width. */}
                    <div className="mx-auto max-w-[1600px] p-5 lg:p-7">
                        {children}
                    </div>
                </main>
            </div>
        </DateRangeProvider>
    );
}