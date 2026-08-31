"use client";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
    enCours: any | null;
    aSuivre: any | null;
    chargement: boolean;
    erreur: string | null;
}

export default function EmissionEnCoursCard({ enCours, aSuivre, chargement, erreur }: Props) {
    if (chargement) {
        return <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-8 text-sm text-[#163A2C]/40">Chargement de l'antenne...</div>;
    }

    if (erreur || !enCours?.programme) {
        return (
            <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-8 text-center">
                <p className="font-bold text-[#163A2C]">Antenne en diffusion générale</p>
                <p className="text-sm text-[#163A2C]/50 mt-1">Aucun créneau programmé pour le moment</p>
            </div>
        );
    }

    const prog = enCours.programme;
    const estCreneauReel = enCours.id !== null; // false = programme par défaut

    return (
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
            <div className="flex gap-5 p-5">
                {prog.image && (
                    <img
                        src={`/storage/${prog.image}`}
                        alt={prog.titre}
                        className="w-40 h-40 rounded-xl object-cover border border-[#163A2C]/10"
                    />
                )}
                <div className="flex-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#163A2C]/5 text-[#163A2C]/60">
                        {estCreneauReel ? "En cours de diffusion" : "Programme par défaut"}
                    </span>
                    <h2 className="text-xl font-black text-[#163A2C] mt-2">{prog.titre}</h2>
                    {prog.animateur && (
                        <p className="text-sm text-[#163A2C]/60">Avec {prog.animateur.nom_scene}</p>
                    )}
                    {prog.description && (
                        <p className="text-sm text-[#163A2C]/50 mt-1 line-clamp-2">{prog.description}</p>
                    )}
                    {estCreneauReel && enCours.heure_debut && (
                        <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#163A2C] mt-3">
                            <Clock size={14} />
                            {enCours.jour} · {enCours.heure_debut} - {enCours.heure_fin}
                        </p>
                    )}
                </div>
            </div>

            {/* À suivre */}
            {aSuivre?.programme && (
                <div className="border-t border-[#163A2C]/10 px-5 py-3 flex items-center gap-2 bg-[#FBF6EA]/50">
                    <ArrowRight size={15} className="text-[#163A2C]/40" />
                    <p className="text-sm text-[#163A2C]/70">
                        <span className="font-bold text-[#163A2C]/50 text-xs uppercase">À suivre :</span>{" "}
                        <span className="font-bold">{aSuivre.programme.titre}</span>
                        {aSuivre.heure_debut && (
                            <span className="text-[#163A2C]/50"> — {aSuivre.jour} {aSuivre.heure_debut}</span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
