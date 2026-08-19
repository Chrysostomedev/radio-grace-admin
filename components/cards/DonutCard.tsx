"use client";

import Link from "next/link";

export interface DonutSegment {
    label: string;
    done:  number;
    total: number;
    color: string; // valeur hex
}

interface DonutCardProps {
    title:        string;
    subtitle?:    string;
    segments:     DonutSegment[];
    viewAllHref?: string;
    viewAllText?: string;
}

// ── SVG Donut ─────────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: DonutSegment[] }) {
    const SIZE   = 130;
    const STROKE = 24;
    const R      = (SIZE - STROKE) / 2;
    const CIRC   = 2 * Math.PI * R;
    const CX     = SIZE / 2;

    const totalDone = segments.reduce((s, g) => s + g.done, 0) || 1;

    let cumOffset = 0;
    const slices = segments.map((seg) => {
        const pct  = seg.done / totalDone;
        const dash = pct * CIRC;
        const gap  = CIRC - dash;
        // rotate: start at top (-90°) + accumulated rotation
        const rot  = cumOffset * 360 - 90;
        cumOffset += pct;
        return { dash, gap, rot, color: seg.color };
    });

    return (
        <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="shrink-0"
            aria-hidden="true"
        >
            {/* Track gris */}
            <circle
                cx={CX} cy={CX} r={R}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={STROKE}
            />
            {/* Segments colorés */}
            {slices.map((s, i) => (
                <circle
                    key={i}
                    cx={CX} cy={CX} r={R}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${s.dash} ${s.gap}`}
                    strokeDashoffset={0}
                    transform={`rotate(${s.rot} ${CX} ${CX})`}
                    strokeLinecap="butt"
                />
            ))}
        </svg>
    );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export default function DonutCard({
    title,
    subtitle = "Tâches Exécutées  sur  Tâches Totales",
    segments,
    viewAllHref,
    viewAllText = "Voir tous",
}: DonutCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5 h-full">

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="font-black text-slate-900 text-[15px] leading-tight">{title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
                </div>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="flex items-center gap-0.5 text-[12px] font-bold text-slate-500 hover:text-[#f97316] transition-colors whitespace-nowrap shrink-0"
                    >
                        {viewAllText}
                        <span className="text-[16px] leading-none">›</span>
                    </Link>
                )}
            </div>

            {/* Corps : légende à gauche + donut à droite */}
            <div className="flex items-center gap-4 flex-1">

                {/* Légende */}
                <div className="flex-1 space-y-3 min-w-0">
                    {segments.map((seg, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-[12px] text-slate-700 font-medium flex-1 truncate leading-tight">
                                {seg.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold shrink-0 tabular-nums">
                                {seg.done}/{seg.total} Tâches
                            </span>
                        </div>
                    ))}
                </div>

                {/* Donut */}
                <DonutChart segments={segments} />
            </div>
        </div>
    );
}
