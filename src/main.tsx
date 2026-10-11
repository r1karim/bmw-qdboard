import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DefectsProvider } from "./context/DefectsContext";
import './index.css'
import App from './App.tsx'
import {TrackingProvider} from "./context/TrackingContext.tsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <DefectsProvider>
            <TrackingProvider>
                <ThemeProvider theme={theme}>
                    <App />
                </ThemeProvider>
            </TrackingProvider>
        </DefectsProvider>
    </StrictMode>
);