import type { LucideIcon } from "lucide-react";

/**
 * Props for the reusable KPI card component.
 *
 * @property title - Heading identifying the KPI.
 * @property value - Numeric value displayed as the main metric.
 * @property icon - Lucide icon component representing the KPI.
 * @property description - Short explanatory text displayed below the value.
 */
type Props = {
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
};

/**
 * Displays a key performance indicator (KPI) in a dashboard card.
 *
 * Presents a title, a configurable Lucide icon, a formatted numeric
 * value, and a short description explaining the metric.
 *
 * Uses locale-aware number formatting to improve readability
 * for large values.
 *
 * @param title - KPI heading.
 * @param value - Numeric KPI value.
 * @param icon - Lucide icon component to display.
 * @param description - Supporting description of the KPI.
 */
export default function KpiCard({
                                    title,
                                    value,
                                    icon: Icon,
                                    description,
                                }: Props) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
            {/* Display the KPI title alongside its associated icon. */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <Icon size={18} className="text-violet-400" />
            </div>

            {/* Format the numeric KPI value using locale-aware separators. */}
            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                {value.toLocaleString()}
            </p>

            {/* Provide context explaining what the displayed metric represents. */}
            <p className="mt-2 text-xs text-zinc-500">{description}</p>
        </div>
    );
}