import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Investigations from "./pages/Investigations";
import DefectExplorer from "./pages/DefectExplorer.tsx";
import OutlierDetection from "./pages/OutlierDetection.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/defects" element={<DefectExplorer />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/outliers" element={<OutlierDetection />} />
                    <Route path="/investigations" element={<Investigations />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
}