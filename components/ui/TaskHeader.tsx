"use client";

import { ChevronLeft, Share2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TaskHeaderAvatarProps {
    src?:      string;
    initials:  string;
    color?:    string;
    // href?: string;
}

interface TaskHeaderProps {
    title:          string;
    badge?:         string;
    badgeBg?:       string; // ex: "bg-orange-100 text-orange-500"
    avatars?:       TaskHeaderAvatarProps[];
    avatarExtra?:   number;
    onShare?:       () => void;
    onDetails?:     () => void;
    detailsHref?:   string;
    backHref?:      string;
    onBack?:        () => void;
}

function AvatarStack({
    avatars,
    extra,
}: {
    avatars: TaskHeaderAvatarProps[];
    extra?: number;
}) {
    return (
        <div className="flex items-center">
            {avatars.slice(0, 3).map((av, i) => (
                <div
                    key={i}
                    style={{
                        marginLeft: i === 0? 0 : -10,
                        zIndex: avatars.length - i,
                    }}
                    className={`w-9 h-9 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-[11px] font-black text-white ${av.color?? "bg-orange-400"}`}
                >
                    {av.src? (
                        <img
                            src={av.src}
                            alt={av.initials}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        av.initials
                    )}
                </div>
            ))}

            {extra!= null && extra > 0 && (
                <div
                    style={{ marginLeft: -10 }}
                    className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[11px] font-black text-slate-600"
                >
                    +{extra}
                </div>
            )}
        </div>
    );
}


/**
 * TaskHeader — barre de titre pour une page tâche/conférence/projet.
 * Capture :  ‹  Conférence 1  [Urgent]     ●●● +4    [Partager]  [Détails]
 */
export default function TaskHeader({
    title,
    badge,
    badgeBg  = "bg-orange-100 text-orange-500",
    avatars  = [],
    avatarExtra,
    onShare,
    onDetails,
    detailsHref,
    backHref,
    onBack,
}: TaskHeaderProps) {
    const router = useRouter();
    const handleBack = onBack ?? (backHref ? () => router.push(backHref) : () => router.back());

    return (
        <div className="flex items-center justify-between gap-4 bg-white border-b border-slate-100 px-6 py-3 sticky top-0 z-20">
            {/* ── Gauche ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2 min-w-0">
                <button
                    onClick={handleBack}
                    className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-500 hover:text-slate-900 shrink-0"
                    aria-label="Retour"
                >
                    <ChevronLeft size={22} strokeWidth={2.5} />
                </button>

                <span className="font-black text-slate-900 text-[17px] leading-tight truncate">
                    {title}
                </span>

                {badge && (
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-black shrink-0 ${badgeBg}`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* ── Droite ──────────────────────────────────────────── */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Avatars */}
                {avatars.length > 0 && (
                    <AvatarStack avatars={avatars} extra={avatarExtra} />
                )}

                {/* Partager */}
                <button
                    onClick={onShare}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#f97316] text-[#f97316] text-[13px] font-semibold hover:bg-orange-50 transition-all"
                >
                    <Share2 size={14} strokeWidth={2} />
                    Partager
                </button>

                {/* Détails */}
                {detailsHref ? (
                    <Link
                        href={detailsHref}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#f97316] text-[#f97316] text-[13px] font-semibold hover:bg-orange-50 transition-all"
                    >
                        <Info size={14} strokeWidth={2} />
                        Détails
                    </Link>
                ) : (
                    <button
                        onClick={onDetails}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#f97316] text-[#f97316] text-[13px] font-semibold hover:bg-orange-50 transition-all"
                    >
                        <Info size={14} strokeWidth={2} />
                        Détails
                    </button>
                )}
            </div>
        </div>
    );
}
