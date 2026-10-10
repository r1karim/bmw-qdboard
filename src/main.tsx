import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DefectsProvider } from "./context/DefectsContext";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <DefectsProvider>
            <App />
        </DefectsProvider>
    </StrictMode>
);