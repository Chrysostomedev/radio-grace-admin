"use client";

import { Battery, Signal, Wifi } from "lucide-react";
import type { LiveSession } from "@/types/admin";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800";

type MobilePreviewProps = {
    /** Session en cours — optionnelle : affiche "Hors ligne" si absente */
    session?: LiveSession | null;
};

export default function MobilePreview({ session = null }: MobilePreviewProps) {
    const isLive = !!session?.is_live;
    const title = session?.titre ?? "Aucune émission en cours";
    const isVideo = session?.type === "VIDEO";

    return (
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[#163A2C] text-sm">Rendu Mobile</h3>
            </div>

            <div className="mx-auto w-[260px]">
                <div className="relative bg-black rounded-[2.5rem] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.25)] border-4 border-black">
                    {/* Dynamic Island */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20" />

                    {/* Screen */}
                    <div className="bg-[#FFFBF0] rounded-[2rem] overflow-hidden aspect-[9/19] relative flex flex-col">
                        {/* Status bar */}
                        <div className="flex justify-between px-6 pt-3 text-[11px] font-bold text-black/70">
                            <span>09:41</span>
                            <span className="flex gap-1">
                                <Signal size={12} />
                                <Wifi size={12} />
                                <Battery size={12} />
                            </span>
                        </div>

                        {/* App header */}
                        <div className="px-4 py-3 flex items-center gap-2 border-b border-black/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/img/logo.png"
                                alt="Logo Radio Grâce-Espoir"
                                className="w-7 h-7 rounded-lg bg-white p-0.5 border border-black/10 object-contain"
                            />
                            <p className="font-black text-xs leading-none">
                                Radio Grâce-Espoir
                            </p>
                            {isLive && (
                                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                                    LIVE
                                </span>
                            )}
                        </div>

                        {/* Player */}
                        <div className="flex-1 p-3 space-y-3 overflow-hidden">
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#0E241C]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={FALLBACK_IMAGE}
                                    alt={title}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="font-bold text-white text-xs leading-tight truncate">
                                        {title}
                                    </p>
                                    <p className="text-white/60 text-[10px]">
                                        {!session
                                            ? "Hors ligne"
                                            : isLive
                                                ? isVideo
                                                    ? "Vidéo en direct"
                                                    : "Audio en direct"
                                                : "En attente"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-3 shadow-sm border border-black/5">
                                <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-[#F0A93E] w-[45%] ${isLive ? "animate-pulse" : ""}`}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-black/40">
                                    <span>{session?.duree_en_cours_minutes ?? 0} min</span>
                                    <span>{isLive ? "Live" : "—"}</span>
                                </div>
                            </div>

                            <div className="bg-[#163A2C] rounded-2xl p-3 text-white">
                                <p className="text-[11px] font-black">
                                    L&apos;Évangile au cœur de l&apos;Homme
                                </p>
                                <p className="text-[10px] text-white/60 mt-1">
                                    Écoutez en FM ou en streaming
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[11px] text-[#163A2C]/40 mt-4">
                Ce que voient vos auditeurs en temps réel
            </p>
        </div>
    );
}
