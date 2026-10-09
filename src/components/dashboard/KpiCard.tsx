
import type { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
};

export default function KpiCard({
                                    title,
                                    value,
                                    icon: Icon,
                                    description,
                                }: Props) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#191a22] p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <Icon size={18} className="text-violet-400" />
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                {value.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-zinc-500">{description}</p>
        </div>
    );
}
