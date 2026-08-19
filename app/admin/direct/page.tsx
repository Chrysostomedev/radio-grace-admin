"use client";
import { useEffect, useState } from "react";
import LivePlayer from "@/components/live/LivePlayer";
import LiveControls from "@/components/live/LiveControls";
import MobilePreview from "@/components/live/MobilePreview";
import StatsCard from "@/components/cards/StatsCard";
import { useLiveSession } from "@/hooks/admin/useLiveSession";
import { liveSessionsService } from "@/services/admin/live-sessions.service";

export default function LivePage() {
    // Récupère la session live la plus récente pour savoir sur quel id "s'accrocher".
    // S'il n'y en a aucune, sessionId reste null → LiveControls affiche le formulaire de création.
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        liveSessionsService
            .getAll()
            .then((res) => setSessionId(res.data[0]?.id ?? null))
            .finally(() => setInitializing(false));
    }, []);

    const { session, saving, create, forceStop } = useLiveSession(sessionId);

    const handleCreate = async (payload: Parameters<typeof create>[0]) => {
        const created = await create(payload);
        if (created) setSessionId(created.id);
        return created;
    };

    if (initializing) {
        return <div className="p-8 text-sm text-[#163A2C]/50">Chargement du studio...</div>;
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#163A2C]">Studio Direct</h1>
                    <p className="text-sm text-[#163A2C]/50">Gérez votre diffusion digitale</p>
                </div>
                <div className="flex gap-3">
                    <StatsCard label="Auditeurs" value={String(session?.auditeurs_live ?? 0)} />
                    <StatsCard label="Statut" value={session?.is_live ? "En direct" : "Hors ligne"} />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
                {/* Gauche — Player + Contrôles */}
                <div className="col-span-12 xl:col-span-8 space-y-5">
                    <LivePlayer session={session} onForceStop={forceStop} saving={saving} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2">
                            <LiveControls session={session} onCreate={handleCreate} onForceStop={forceStop} saving={saving} />
                        </div>
                        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
                            <h4 className="font-black text-[#163A2C] text-sm mb-3">Chat auditeurs (live)</h4>
                            {/* TODO : brancher sur Laravel Reverb pour du vrai temps réel.
                                En attendant, ce panneau reste statique — pas de fausses données
                                dynamiques tant que l'API de chat n'est pas branchée ici. */}
                            <p className="text-xs text-[#163A2C]/40">
                                Le chat s&apos;activera automatiquement une fois la session en direct.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Droite — Aperçu mobile */}
                <div className="col-span-12 xl:col-span-4">
                    <div className="xl:sticky xl:top-6">
                        <MobilePreview session={session} />
                    </div>
                </div>
            </div>
        </div>
    );
}