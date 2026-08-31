"use client";
import { Radio } from "lucide-react";
import RadioKingPreview from "@/components/live/RadioKingPreview";
import MobilePreview from "@/components/live/MobilePreview";
import EmissionEnCoursCard from "@/components/cards/EmissionEnCoursCard";
import { useProgrammeEnCoursAdmin } from "@/hooks/admin/useProgrammeEnCoursAdmin";

export default function LivePage() {
    const { enCours, aSuivre, chargement, erreur } = useProgrammeEnCoursAdmin();

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#163A2C]">Contrôle Antenne</h1>
                    <p className="text-sm text-[#163A2C]/50">
                        Le flux RadioKing diffuse en continu — suivez l'émission en cours
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                    <Radio size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">Flux actif 24h/24</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
                {/* Colonne principale : émission en cours */}
                <div className="col-span-12 xl:col-span-8">
                    <EmissionEnCoursCard
                        enCours={enCours}
                        aSuivre={aSuivre}
                        chargement={chargement}
                        erreur={erreur}
                    />
                </div>

                {/* Colonne latérale : écoute contrôle + aperçu mobile */}
                <div className="col-span-12 xl:col-span-4 space-y-5">
                    <div className="xl:sticky xl:top-6 space-y-5">
                        <RadioKingPreview />
                        <MobilePreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
