
interface SectionPlaceholderProps {
    title: string;
    description?: string;
    height?: string;
}

export default function SectionPlaceholder({
                                               title,
                                               description,
                                               height = "h-64",
                                           }: SectionPlaceholderProps) {
    return (
        <section className="rounded-xl border border-white/[0.08] bg-[#191a22] p-5">
            <h3 className="text-sm font-semibold text-white">
                {title}
            </h3>

            {description && (
                <p className="mt-1 text-[11px] text-zinc-500">
                    {description}
                </p>
            )}

            <div className={`mt-5 flex ${height} items-center justify-center rounded-lg border border-dashed border-white/10`}>
                <p className="text-xs text-zinc-600">
                    Component coming soon
                </p>
            </div>
        </section>
    );
}
