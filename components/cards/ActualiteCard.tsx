"use client";

import { useRouter } from "next/navigation";
import { Eye, Heart, Share2, MessageCircle, Calendar, ArrowUpRight } from "lucide-react";

export interface ActualiteSummary {
    id: number | string;
    name: string;
    initials: string;
    color: string;
    image?: string;
    category: "diocese" | "eglise" | "vatican" | "laicat" | "societe";
    total: number;
    en_cours: number;
    terminees: number;
    en_retard: number;
    priority?: "high" | "low" | "medium";
    date?: string;
    href?: string;
}

interface Props {
    actualite: ActualiteSummary;
    basePath?: string;
}

const CATEGORY_CFG: Record<string, { label: string; bg: string; text: string }> = {
    diocese: { label: "Diocèse Daoa", bg: "bg-[#F0A93E]/15", text: "text-[#9A6A1E]" },
    eglise: { label: "Église", bg: "bg-[#163A2C]/10", text: "text-[#163A2C]" },
    vatican: { label: "Vatican", bg: "bg-[#1E9D55]/10", text: "text-[#1E5A3D]" },
    laicat: { label: "Laïcat", bg: "bg-[#FBF6EA]", text: "text-[#163A2C]/70" },
    societe: { label: "Société", bg: "bg-slate-100", text: "text-slate-600" },
};

const PRIORITY_CFG: Record<string, { label: string; bg: string; text: string }> = {
    high: { label: "À la une", bg: "bg-red-100", text: "text-red-600" },
    medium: { label: "Important", bg: "bg-[#F0A93E]/20", text: "text-[#9A6A1E]" },
    low: { label: "Standard", bg: "bg-[#163A2C]/5", text: "text-[#163A2C]/60" },
};

function ProgressRing({ pct, color }: { pct: number; color: string }) {
    const r = 22;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={52} height={52} viewBox="0 0 52 52" className="-rotate-90 shrink-0">
            <circle cx="26" cy="26" r={r} fill="none" stroke="#163A2C1A" strokeWidth="5" />
            <circle
                cx="26"
                cy="26"
                r={r}
                fill="none"
                stroke={color}
                strokeWidth="5"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeLinecap="round"
                className="transition-all duration-700"
            />
        </svg>
    );
}

export default function ActualiteCard({ actualite, basePath = "/admin/actualites" }: Props) {
    const router = useRouter();
    const engagement =
        actualite.total > 0
            ? Math.round(((actualite.en_cours + actualite.terminees) / actualite.total) * 100)
            : 0;
    const pct = Math.min(100, engagement);
    const cat = CATEGORY_CFG[actualite.category] ?? CATEGORY_CFG.societe;
    const prio = PRIORITY_CFG[actualite.priority ?? "low"];
    const ringColor = pct >= 60 ? "#1E9D55" : pct >= 30 ? "#F0A93E" : "#163A2C";

    return (
        <div
            onClick={() => router.push(actualite.href ?? `${basePath}/${actualite.id}`)}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#163A2C]/10 bg-white shadow-sm ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(22,58,44,0.14)]"
        >
            {/* Bandeau image */}
            <div className="relative h-52 w-full overflow-hidden bg-[#FBF6EA]">
                {actualite.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={actualite.image}
                        alt={actualite.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className={`flex h-full w-full items-center justify-center text-xl font-black text-white ${actualite.color}`}
                    >
                        {actualite.initials}
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0E241C]/75 via-[#0E241C]/10 to-transparent" />

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span
                        className={`rounded-full border border-black/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md ${cat.bg} ${cat.text}`}
                    >
                        {cat.label}
                    </span>
                    <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${prio.bg} ${prio.text}`}
                    >
                        {prio.label}
                    </span>
                </div>

                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#163A2C] backdrop-blur-md">
                    <Calendar size={11} /> {actualite.date ?? "24 Juil"}
                </div>

                <div className="absolute inset-x-3 bottom-3">
                    <h3 className="text-lg font-black leading-tight text-white drop-shadow line-clamp-2">
                        {actualite.name}
                    </h3>
                </div>
            </div>

            {/* Contenu */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                    <div className="grid flex-1 grid-cols-4 gap-2">
                        <div className="flex flex-col items-center gap-1 rounded-xl bg-[#FBF6EA] px-2 py-2.5">
                            <Eye size={13} className="text-[#163A2C]/40" />
                            <p className="text-sm font-black text-[#163A2C]">{actualite.total}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-xl bg-[#F0A93E]/10 px-2 py-2.5">
                            <Heart size={13} className="text-[#E0972E]" />
                            <p className="text-sm font-black text-[#9A6A1E]">{actualite.en_cours}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-xl bg-[#1E9D55]/10 px-2 py-2.5">
                            <Share2 size={13} className="text-[#1E5A3D]" />
                            <p className="text-sm font-black text-[#1E5A3D]">{actualite.terminees}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-xl bg-[#163A2C]/5 px-2 py-2.5">
                            <MessageCircle size={13} className="text-[#163A2C]/50" />
                            <p className="text-sm font-black text-[#163A2C]">{actualite.en_retard}</p>
                        </div>
                    </div>

                    <div className="relative ml-3">
                        <ProgressRing pct={pct} color={ringColor} />
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#163A2C]">
                            {pct}%
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#163A2C]/5 pt-3">
                    <div className="h-1.5 w-full rounded-full bg-[#163A2C]/10">
                        <div
                            className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: ringColor }}
                        />
                    </div>
                    <div className="ml-1 flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-[#F0A93E] transition group-hover:text-[#163A2C]">
                        Lire <ArrowUpRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
}