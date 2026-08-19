"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ActionHeaderProps {
    /** Titre principal */
    title: string;
    /** Badge / label coloré affiché à côté du titre (ex : "Urgent") */
    badge?: string;
    badgeColor?: string; // bg tailwind class, défaut bg-orange-100 text-orange-500
    /** Lien "Voir tous" à droite */
    href?: string;
    linkText?: string;
    /** Boutons d'action à droite (ex : Partager, Détails) */
    actions?: {
        label: string;
        icon?: React.ReactNode;
        onClick?: () => void;
        href?: string;
        variant?: "outline" | "primary";
    }[];
    /** Avatars groupés (ex : +4 participants) */
    avatars?: { src?: string; initials: string; color?: string }[];
    avatarExtra?: number;
    /** Bouton retour */
    showBack?: boolean;
    onBack?: () => void;
}

function AvatarGroup({
    avatars,
    extra,
}: {
    avatars: ActionHeaderProps["avatars"];
    extra?: number;
}) {
    if (!avatars?.length) return null;
    return (
        <div className="flex items-center">
            {avatars.slice(0, 3).map((av, i) => (
                <div
                    key={i}
                    style={{ zIndex: avatars.length - i, marginLeft: i === 0 ? 0 : -10 }}
                    className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-black text-white overflow-hidden ${av.color ?? "bg-orange-400"}`}
                >
                    {av.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={av.src} alt={av.initials} className="w-full h-full object-cover" />
                    ) : av.initials}
                </div>
            ))}
            {extra && extra > 0 && (
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

export default function ActionHeader({
    title,
    badge,
    badgeColor = "bg-orange-100 text-orange-500",
    href,
    linkText = "Voir tous",
    actions,
    avatars,
    avatarExtra,
    showBack = false,
    onBack,
}: ActionHeaderProps) {
    const router = useRouter();
    const handleBack = onBack ?? (() => router.back());

    const hasRight = actions?.length || avatars?.length || href;

    return (
        <div className="flex items-center justify-between gap-4 w-full py-2">
            {/* ── Gauche ── */}
            <div className="flex items-center gap-2 min-w-0">
                {showBack && (
                    <button
                        onClick={handleBack}
                        className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-500 hover:text-slate-900 shrink-0"
                        aria-label="Retour"
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                )}
                <h2 className="font-black text-slate-900 text-[17px] leading-tight truncate">{title}</h2>
                {badge && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* ── Droite ── */}
            {hasRight && (
                <div className="flex items-center gap-3 shrink-0">
                    {/* Avatars */}
                    {avatars?.length && (
                        <AvatarGroup avatars={avatars} extra={avatarExtra} />
                    )}

                    {/* Boutons custom */}
                    {actions?.map((a, i) => {
                        const cls = `flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all
                            ${a.variant === "primary"
                                ? "bg-[#f97316] border-[#f97316] text-white hover:opacity-90"
                                : "border-[#f97316] text-[#f97316] bg-white hover:bg-orange-50"
                            }`;
                        if (a.href) return (
                            <Link key={i} href={a.href} className={cls}>
                                {a.icon}{a.label}
                            </Link>
                        );
                        return (
                            <button key={i} onClick={a.onClick} className={cls}>
                                {a.icon}{a.label}
                            </button>
                        );
                    })}

                    {/* Lien "Voir tous" simple */}
                    {!actions?.length && href && (
                        <Link
                            href={href}
                            className="flex items-center gap-1 text-[13px] font-bold text-slate-500 hover:text-[#f97316] transition-colors"
                        >
                            {linkText}
                            <ChevronRight size={15} strokeWidth={2.5} />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
