"use client";
import { useEffect, useState } from "react";
import LivePlayer from "@/components/live/LivePlayer";
import LiveControls from "@/components/live/LiveControls";
import MobilePreview from "@/components/live/MobilePreview";
import RadioKingPreview from "@/components/live/RadioKingPreview";
import StatsCard from "@/components/cards/StatsCard";
import { useLiveSession } from "@/hooks/admin/useLiveSession";
import { liveSessionsService } from "@/services/admin/live-sessions.service";

export default function LivePage() {
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
            {/* Header + stats */}
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
                {/* Colonne principale */}
                <div className="col-span-12 xl:col-span-8 space-y-5">
                    <LivePlayer session={session} onForceStop={forceStop} saving={saving} />
                    <LiveControls session={session} onCreate={handleCreate} onForceStop={forceStop} saving={saving} />
                </div>

                {/* Colonne latérale : écoute contrôle + aperçu mobile */}
                <div className="col-span-12 xl:col-span-4 space-y-5">
                    <div className="xl:sticky xl:top-6 space-y-5">
                        <RadioKingPreview />
                        <MobilePreview session={session} />
                    </div>
                </div>
            </div>
        </div>
    );
}
