"use client";
// npm install hls.js
import { useEffect, useRef, useState } from "react";
import { Radio, WifiOff } from "lucide-react";
import type { LiveSession } from "@/types/admin";

interface LivePlayerProps {
    session: LiveSession | null;
    onForceStop: () => void;
    saving: boolean;
}

export default function LivePlayer({ session, onForceStop, saving }: LivePlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playerError, setPlayerError] = useState<string | null>(null);

    const isLive = !!session?.is_live;
    const isVideo = session?.type === "VIDEO";
    const streamUrl = session?.stream_url;

    // ── Branchement hls.js sur le flux HLS réel (pas de mock ici) ───────────
    useEffect(() => {
        if (!isLive || !streamUrl) return;

        const mediaEl = isVideo ? videoRef.current : audioRef.current;
        if (!mediaEl) return;

        setPlayerError(null);
        let hls: import("hls.js").default | null = null;

        // Safari lit le HLS nativement, pas besoin de hls.js
        if (mediaEl.canPlayType("application/vnd.apple.mpegurl")) {
            mediaEl.src = streamUrl;
            mediaEl.play().catch(() => {});
            return;
        }

        import("hls.js").then(({ default: Hls }) => {
            if (!Hls.isSupported()) {
                setPlayerError("Ce navigateur ne supporte pas la lecture HLS.");
                return;
            }
            hls = new Hls({ lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(mediaEl);
            hls.on(Hls.Events.ERROR, (_evt, data) => {
                if (data.fatal) setPlayerError("Flux interrompu ou inaccessible.");
            });
            mediaEl.play().catch(() => {});
        });

        return () => hls?.destroy();
    }, [isLive, streamUrl, isVideo]);

    return (
        <div className="relative rounded-2xl overflow-hidden bg-[#0E241C] aspect-video">
            {isVideo ? (
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline controls={isLive} />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/70">
                    <Radio size={48} className={isLive ? "text-[#F0A93E]" : "text-white/30"} />
                    <p className="text-sm font-semibold">{isLive ? "Direct audio en cours" : "Aucun direct audio"}</p>
                    {isLive && <audio ref={audioRef} className="hidden" />}
                </div>
            )}

            {/* Badge statut — reflète l'état RÉEL renvoyé par le webhook MediaMTX, pas un toggle local */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        En direct · {session?.type}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#163A2C]/70 text-white/80 text-xs font-bold">
                        <WifiOff size={12} />
                        Hors ligne — en attente d&apos;OBS
                    </span>
                )}
            </div>

            {isLive && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-bold">
                    {session?.auditeurs_live ?? 0} auditeurs
                </div>
            )}

            {playerError && (
                <div className="absolute inset-x-4 bottom-16 px-3 py-2 rounded-lg bg-red-600/90 text-white text-xs font-semibold">
                    {playerError}
                </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                    <p className="text-white font-bold text-sm">{session?.titre ?? "Aucune session programmée"}</p>
                    <p className="text-white/50 text-xs">{session?.programme?.titre}</p>
                </div>
                {isLive && (
                    <button
                        onClick={onForceStop}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-600 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                        Couper le direct
                    </button>
                )}
            </div>
        </div>
    );
}
