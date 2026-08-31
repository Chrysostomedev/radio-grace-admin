"use client";
import { useState, useMemo } from "react";
import { Copy, Check, Radio, Square, Settings, Loader2 } from "lucide-react";
import { useProgrammes } from "@/hooks/admin/useProgrammes";
import type { LiveSession, LiveSessionPayload } from "@/types/admin";

interface LiveControlsProps {
    session: LiveSession | null;
    onCreate: (payload: LiveSessionPayload) => Promise<LiveSession | null>;
    onForceStop: () => void;
    saving: boolean;
}

function CopyField({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#163A2C]/40 mb-1">{label}</p>
            <button
                onClick={copy}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/10 text-left group hover:border-[#F0A93E] transition"
            >
                <code className="text-xs text-[#163A2C] font-mono truncate">{value}</code>
                {copied ? <Check size={14} className="text-green-600 shrink-0" /> : <Copy size={14} className="text-[#163A2C]/40 shrink-0 group-hover:text-[#163A2C]" />}
            </button>
        </div>
    );
}

export default function LiveControls({ session, onCreate, onForceStop, saving }: LiveControlsProps) {
    const { programmes, loading: loadingProgrammes } = useProgrammes();
    const [programmeId, setProgrammeId] = useState<number | "">("");
    const [type, setType] = useState<"AUDIO" | "VIDEO">("VIDEO");

    // Même filtre que la grille : uniquement les vraies émissions
    const validProgrammes = useMemo(
        () => programmes?.filter((p) =>
            p.categorie && ["ACCLAMEZ", "PRIERE", "JEUNESSE", "ACTUALITE", "MUSIQUE"].includes(p.categorie)
        ) ?? [],
        [programmes]
    );

    // ── Aucune session : formulaire avec sélection du programme ─────────────
    if (!session) {
        return (
            <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 space-y-4">
                <h3 className="font-black text-[#163A2C] text-sm">Nouvelle session</h3>

                {/* Sélection du programme (remplace la saisie libre) */}
                <div>
                    <label htmlFor="live-programme" className="text-[11px] font-bold uppercase tracking-wide text-[#163A2C]/40 mb-1 block">
                        Programme à diffuser
                    </label>
                    <select
                        id="live-programme"
                        value={programmeId}
                        onChange={(e) => setProgrammeId(e.target.value ? Number(e.target.value) : "")}
                        disabled={loadingProgrammes}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#163A2C]/10 text-sm bg-white text-[#163A2C] focus:outline-none focus:border-[#F0A93E] disabled:opacity-50"
                    >
                        <option value="">
                            {loadingProgrammes ? "Chargement des émissions..." : "— Sélectionner une émission —"}
                        </option>
                        {validProgrammes.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.titre} {p.categorie ? `· ${p.categorie}` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Type de flux — inchangé */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setType("VIDEO")}
                        className={`p-3 rounded-xl border text-sm font-bold transition ${type === "VIDEO" ? "bg-[#163A2C] text-white border-[#163A2C]" : "bg-[#FBF6EA] border-[#163A2C]/10 text-[#163A2C]"}`}
                    >
                        Vidéo
                    </button>
                    <button
                        onClick={() => setType("AUDIO")}
                        className={`p-3 rounded-xl border text-sm font-bold transition ${type === "AUDIO" ? "bg-[#F0A93E] text-[#163A2C] border-[#F0A93E]" : "bg-white border-[#163A2C]/10 text-[#163A2C]/60"}`}
                    >
                        Audio seul
                    </button>
                </div>

                <button
                    disabled={!programmeId || saving}
                    onClick={() => onCreate({ programme_id: programmeId as number, type })}
                    className="w-full h-12 rounded-xl bg-[#163A2C] text-white font-black text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-[#0E241C] transition flex items-center justify-center gap-2"
                >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {saving ? "Création..." : "Créer la session"}
                </button>
            </div>
        );
    }

    // ── Session créée mais OBS pas connecté : identifiants à copier ─────────
    if (!session.is_live) {
        return (
            <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-[#163A2C] text-sm">Configuration OBS</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-[#FBF6EA] text-[#163A2C]/60">En attente</span>
                </div>
                <p className="text-xs text-[#163A2C]/50 leading-relaxed">
                    Session : <strong className="text-[#163A2C]">{session.programme?.titre ?? session.titre}</strong>.
                    Collez ces valeurs dans OBS → Paramètres → Flux → Service <strong>Personnalisé</strong>,
                    puis cliquez « Démarrer la diffusion ».
                </p>
                {session.obs && (
                    <div className="space-y-3">
                        <CopyField label="Serveur" value={session.obs.serveur} />
                        <CopyField label="Clé de flux" value={session.obs.cle_de_flux} />
                    </div>
                )}
            </div>
        );
    }

    // ── En direct : statut + coupure d'urgence ──────────────────────────────
    return (
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="font-black text-[#163A2C] text-sm">Studio Control</h3>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-red-100 text-red-600">En direct</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#163A2C]/70">
                <Radio size={16} className="text-[#F0A93E]" />
                <span>
                    Diffusion : <strong className="text-[#163A2C]">{session.programme?.titre ?? session.titre}</strong>
                </span>
            </div>

            <button
                onClick={onForceStop}
                disabled={saving}
                className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-red-500 text-white shadow-lg shadow-red-200 disabled:opacity-50 transition"
            >
                <Square size={16} fill="white" /> Couper le direct (urgence)
            </button>

            <div className="flex items-center gap-2 text-[11px] text-[#163A2C]/40 pt-2 border-t border-[#163A2C]/5">
                <Settings size={12} /> Signal : {session.signal} • {session.duree_en_cours_minutes ?? 0} min de direct
            </div>
        </div>
    );
}
