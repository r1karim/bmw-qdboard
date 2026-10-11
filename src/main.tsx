import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DefectsProvider } from "./context/DefectsContext";
import './index.css'
import App from './App.tsx'
import {TrackingProvider} from "./context/TrackingContext.tsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

/**
 * Application entry point.
 *
 * Mounts the React application into the root HTML element and configures
 * the global providers required by the dashboard.
 *
 * Provider hierarchy:
 * - StrictMode: Enables additional React development checks.
 * - DefectsProvider: Makes shared defect report data available.
 * - TrackingProvider: Provides shared tracking state and operations.
 * - ThemeProvider: Applies the custom Material UI theme.
 * - App: Renders the application layout and configured routes.
 *
 * Providers wrap App so their context and configuration are available
 * to all descendant components.
 */

// Create the React root using the application's HTML mount element.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* Enable additional development checks for React components. */}
        <DefectsProvider>
            {/* Make shared defect report data available throughout the application. */}
            <TrackingProvider>
                {/* Provide the configured Material UI theme to descendant components. */}
                <ThemeProvider theme={theme}>
                    {/* Render the root application component and its routes. */}
                    <App />
                </ThemeProvider>
            </TrackingProvider>
        </DefectsProvider>
    </StrictMode>
);