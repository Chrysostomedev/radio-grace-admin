"use client";
import { useState } from "react";
import { Volume2, ExternalLink, Loader2 } from "lucide-react";

// ⚠️ Centralise l'URL dans une constante (ou viens la chercher depuis /parametres)
const RADIOKING_EMBED = "https://play.radioking.io/radio-grace-espoir";

export default function RadioKingPreview() {
    const [playing, setPlaying] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-[#F0A93E]" />
                    <h3 className="font-black text-[#163A2C] text-sm">Écoute de contrôle</h3>
                </div>
                <a
                    href={RADIOKING_EMBED}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#163A2C]/50 hover:text-[#163A2C] transition"
                >
                    Ouvrir RadioKing <ExternalLink size={12} />
                </a>
            </div>

            {playing ? (
                <div className="relative rounded-xl overflow-hidden border border-[#163A2C]/10">
                    {/* Player RadioKing officiel — lit le VRAI flux que les auditeurs entendent */}
                    <iframe
                        src={`${RADIOKING_EMBED}?autoplay=1`}
                        allow="autoplay"
                        className="w-full h-[152px] border-0"
                        title="Player RadioKing"
                    />
                    <button
                        onClick={() => setPlaying(false)}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#163A2C]/85 text-white text-[11px] font-bold hover:bg-[#163A2C] transition"
                    >
                        Arrêter l'écoute
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setPlaying(true)}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-[#163A2C]/15 flex flex-col items-center justify-center gap-1.5 text-[#163A2C]/50 hover:border-[#F0A93E] hover:text-[#163A2C] transition group"
                >
                    <Volume2 size={22} className="group-hover:text-[#F0A93E] transition" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                        Lancer l'écoute de contrôle
                    </span>
                    <span className="text-[10px] text-[#163A2C]/35">
                        Vérifiez le flux exact entendu par vos auditeurs
                    </span>
                </button>
            )}

            <p className="text-[11px] text-[#163A2C]/40 leading-relaxed">
                💡 Cette écoute passe par RadioKing, indépendamment d'OBS. Utilisez-la pour
                vérifier que le son diffusé est correct, même hors session live.
            </p>
        </div>
    );
}
