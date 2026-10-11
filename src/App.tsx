import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import DefectExplorer from "./pages/DefectExplorer.tsx";
import OutlierDetection from "./pages/OutlierDetection.tsx";
import VinAnomalies from "./pages/VinAnomalies";
import Tracking from "./pages/Tracking";

/**
 * Root application component responsible for client-side routing.
 *
 * Configures the main navigation routes for the quality dashboard
 * and renders each page within the shared MainLayout component.
 *
 * BrowserRouter enables navigation using browser URLs without requiring
 * a full page reload for each route change.
 *
 * Unrecognized routes are redirected to the dashboard.
 *
 * @returns The application router, shared layout, and configured routes.
 */
export default function App() {
    return (
        <BrowserRouter>
            {/* Provide a consistent layout across all application pages. */}
            <MainLayout>
                {/* Render the page component matching the current URL. */}
                <Routes>
                    {/* Main dashboard containing quality metrics and charts. */}
                    <Route path="/" element={<Dashboard />} />

                    {/* Defect report exploration and filtering. */}
                    <Route path="/defects" element={<DefectExplorer />} />

                    {/* Statistical and rule-based defect outlier detection. */}
                    <Route path="/outliers" element={<OutlierDetection />} />

                    {/* Tracking of saved chart snapshots and observations. */}
                    <Route path="/tracking" element={<Tracking />} />

                    {/* Investigation of inconsistent vehicle attributes by VIN. */}
                    <Route path="/anomalies" element={<VinAnomalies /> }/>

                    {/* Redirect unknown URLs to the dashboard without adding a history entry. */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
}