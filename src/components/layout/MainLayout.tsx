import type { ReactNode } from "react";
import { DateRangeProvider } from "../../context/DateRangeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <DateRangeProvider>
            <div className="h-screen overflow-hidden bg-[#101116] text-zinc-100 lg:flex">
                <Sidebar />

                <main className="min-w-0 flex-1 overflow-y-auto">
                    <Header />
                    <div className="mx-auto max-w-[1600px] p-5 lg:p-7">
                        {children}
                    </div>
                </main>
            </div>
        </DateRangeProvider>
    );
}