/**
 * Props for the reusable section placeholder.
 *
 * @property title - Heading displayed at the top of the section.
 * @property description - Optional explanatory text below the heading.
 * @property height - Tailwind CSS height class for the placeholder area.
 */
interface SectionPlaceholderProps {
    title: string;
    description?: string;
    height?: string;
}

/**
 * Renders a placeholder for dashboard sections that are not yet implemented.
 *
 * Displays a configurable title, optional description, and a dashed
 * placeholder area indicating that the component is coming soon.
 *
 * @param title - Section heading.
 * @param description - Optional section description.
 * @param height - Placeholder height class, defaulting to "h-64".
 */
export default function SectionPlaceholder({
                                               title,
                                               description,
                                               height = "h-64",
                                           }: SectionPlaceholderProps) {
    return (
        // Section container styled consistently with other dashboard cards.
        <section className="rounded-xl border border-white/[0.08] bg-[#191a22] p-5">
            {/* Display the section heading. */}
            <h3 className="text-sm font-semibold text-white">
                {title}
            </h3>

            {/* Render the description only when one is provided. */}
            {description && (
                <p className="mt-1 text-[11px] text-zinc-500">
                    {description}
                </p>
            )}

            {/* Use the configurable height and dashed border for the placeholder area. */}
            <div className={`mt-5 flex ${height} items-center justify-center rounded-lg border border-dashed border-white/10`}>
                <p className="text-xs text-zinc-600">
                    Component coming soon
                </p>
            </div>
        </section>
    );
}
