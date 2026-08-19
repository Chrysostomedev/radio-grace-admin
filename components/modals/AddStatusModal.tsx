"use client";

import { useState, useEffect } from "react";
import { X, Info, Loader2 } from "lucide-react";
import type { ProjectStatus, ProjectStatusPayload } from "@/types/admin";
import { toast } from "sonner";

const SWATCHES = [
    "#f97316","#6366f1","#0ea5e9","#10b981",
    "#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#64748b",
];

interface Props {
    isOpen:    boolean;
    onClose:   () => void;
    projectId: number;
    statuses:  ProjectStatus[]; // les 4 statuts fixes retournés par fetchStatusesByProject
    onSubmit:  (payload: ProjectStatusPayload) => Promise<boolean>;
    isSaving:  boolean;
}

export default function AddStatusModal({ isOpen, onClose, projectId, statuses, onSubmit, isSaving }: Props) {
    const [name,         setName]         = useState("");
    const [code,         setCode]         = useState("");
    const [color,        setColor]        = useState("#6366f1");
    const [hexInput,     setHexInput]     = useState("#6366f1");
    const [targetCode,   setTargetCode]   = useState<"en_cours" | "termine">("en_cours");
    const [positionType, setPositionType] = useState<"after" | "before">("after");

    // Reset à chaque ouverture
    useEffect(() => {
        if (isOpen) {
            setName(""); setCode(""); setColor("#6366f1");
            setHexInput("#6366f1"); setTargetCode("en_cours"); setPositionType("after");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Retrouve l'ID du statut cible dynamiquement depuis la liste réelle
    const getTargetId = (): number | null => {
        const codes = targetCode === "en_cours"
            ? ["EN_COUR", "EN_COURS", "in_progress", "IN_PROGRESS"]
            : ["TERMINER", "TERMINE", "done", "DONE"];
        
        for (const c of codes) {
            const found = statuses.find(s => s.code === c);
            if (found) return found.id;
        }
        return null;
    };

    const handleNameChange = (v: string) => {
        setName(v);
        setCode(v.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, ""));
    };

    const applyColor = (v: string) => { setColor(v); setHexInput(v); };

    const handleHexInput = (v: string) => {
        setHexInput(v);
        if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !code.trim()) return;
        const target_status_id = getTargetId();
        if (!target_status_id) {
            toast.error("Statut cible introuvable — rechargez la page.");
            return;
        }

        const payload: ProjectStatusPayload = {
            name:             name.trim(),
            code:             code.trim(),
            color,
            project_id:       projectId,
            target_status_id,
            position_type:    positionType,
        };
        const ok = await onSubmit(payload);
        if (ok) onClose();
    };

    const targetLabel    = targetCode === "en_cours" ? "En cours" : "Terminé";
    const positionLabel  = positionType === "after" ? "après" : "avant";

    return (
        <>
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col">

                    {/* Header */}
                    <div className="px-8 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between">
                        <div>
                            <h2 className="text-[17px] font-black text-slate-900">Ajouter un statut personnalisé</h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">
                                Inséré entre <span className="font-bold text-slate-600">En cours</span> et <span className="font-bold text-slate-600">Terminé</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-6 space-y-5">

                        {/* Nom */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Nom du statut
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="ex : En révision"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-orange-400 transition"
                            />
                        </div>

                        {/* Code — auto-généré mais éditable */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                                placeholder="ex : EN_REVISION"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-orange-400 transition"
                            />
                        </div>

                        {/* Couleur */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Couleur de la colonne
                            </label>
                            <div className="flex items-center gap-3">
                                {/* Preview */}
                                <div
                                    className="w-10 h-10 rounded-xl border border-slate-200 shrink-0 transition-colors duration-150"
                                    style={{ background: color }}
                                />
                                {/* Hex input */}
                                <input
                                    type="text"
                                    value={hexInput}
                                    onChange={e => handleHexInput(e.target.value)}
                                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] font-mono text-slate-900 focus:outline-none focus:border-orange-400 transition"
                                    maxLength={7}
                                />
                                {/* Native color picker */}
                                <div className="relative w-10 h-10 shrink-0">
                                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400 pointer-events-none">
                                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                        </svg>
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={e => applyColor(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Swatches */}
                            <div className="flex gap-1.5 flex-wrap mt-3">
                                {SWATCHES.map(sw => (
                                    <button
                                        key={sw}
                                        onClick={() => applyColor(sw)}
                                        className="w-6 h-6 rounded-md transition-transform hover:scale-110"
                                        style={{
                                            background: sw,
                                            outline: color === sw ? "2px solid #0f172a" : "2px solid transparent",
                                            outlineOffset: "2px",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Position */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Par rapport à
                                </label>
                                <select
                                    value={targetCode}
                                    onChange={e => setTargetCode(e.target.value as "en_cours" | "termine")}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:border-orange-400 transition bg-white"
                                >
                                    <option value="en_cours">En cours</option>
                                    <option value="termine">Terminé</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Position
                                </label>
                                <select
                                    value={positionType}
                                    onChange={e => setPositionType(e.target.value as "after" | "before")}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:border-orange-400 transition bg-white"
                                >
                                    <option value="after">Après</option>
                                    <option value="before">Avant</option>
                                </select>
                            </div>
                        </div>

                        {/* Info band */}
                        <div className="flex items-start gap-2.5 bg-orange-50 rounded-xl px-4 py-3">
                            <Info size={14} className="text-orange-400 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-orange-700 leading-relaxed">
                                Le statut sera inséré <strong>{positionLabel} « {targetLabel} »</strong>, visible immédiatement dans le tableau Kanban.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-7 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition text-[13px]"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!name.trim() || !code.trim() || isSaving}
                            className="flex-1 py-3 rounded-2xl bg-[#f97316] text-white font-bold hover:opacity-90 transition text-[13px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 size={14} className="animate-spin" />}
                            Ajouter le statut
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}