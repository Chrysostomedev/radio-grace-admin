"use client";

import { useState, useEffect, useRef } from "react";
import { Star, X, Upload, FileText, FileSpreadsheet, Image as ImageIcon, Loader2, Info } from "lucide-react";

interface StatusChangeModalProps {
    isOpen:       boolean;
    onClose:      () => void;
    targetLabel:  string;
    onConfirm:    (comment: string, files: File[], score?: number) => Promise<void>;
    isLoading:    boolean;
    requireFiles?: boolean;
    requireScore?: boolean;
}

function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf") return <FileText size={20} className="text-red-500 shrink-0" />;
    if (["xls", "xlsx"].includes(ext)) return <FileSpreadsheet size={20} className="text-green-600 shrink-0" />;
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return <ImageIcon size={20} className="text-purple-500 shrink-0" />;
    return <FileText size={20} className="text-blue-600 shrink-0" />;
}

export default function StatusChangeModal({
    isOpen, onClose, targetLabel, onConfirm, isLoading, requireFiles = false, requireScore = false,
}: StatusChangeModalProps) {
    const [comment, setComment] = useState("");
    const [files, setFiles]     = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [score, setScore]     = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) { setComment(""); setFiles([]); setDragOver(false); setScore(0); }
    }, [isOpen]);

    if (!isOpen) return null;

    const canSubmit = (!requireFiles || files.length > 0) && (!requireScore || score > 0) && !isLoading;

    const addFiles = (newFiles: FileList) => {
        const arr = Array.from(newFiles);
        setFiles(prev => [...prev, ...arr]);
    };

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={onClose} />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-8 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between shrink-0">
                        <div>
                            <h2 className="text-[17px] font-black text-slate-900">
                                Changer le statut
                            </h2>
                            <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                                Vers <span className="font-semibold text-[#f97316]">{targetLabel}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
                        {/* Comment */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Commentaire (facultatif)
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={3}
                                placeholder="Ajoutez une note..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-orange-400 transition resize-none"
                            />
                        </div>

                        {/* Upload */}
                        {requireFiles && (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Documents livrables <span className="text-orange-400">*</span>
                                </label>

                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
                                    className={`relative border-2 border-dashed rounded-xl py-5 flex flex-col items-center gap-2 transition-colors ${
                                        dragOver ? "border-[#f97316] bg-orange-50" : "border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <Upload size={20} className="text-[#f97316]" />
                                    <p className="text-[12px] text-slate-500 font-medium text-center">
                                        Glissez vos fichiers ici ou <span className="text-[#f97316] font-bold cursor-pointer">parcourir</span>
                                    </p>
                                    <p className="text-[11px] text-slate-300">PDF, Excel, Word, Image — Plusieurs fichiers possibles</p>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                        multiple
                                        onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
                                    />
                                </div>

                                {/* Files list */}
                                {files.length > 0 && (
                                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                        {files.map((f, i) => (
                                            <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                {getFileIcon(f.name)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-bold text-slate-800 truncate">{f.name}</p>
                                                    <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                                <button onClick={() => removeFile(i)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rating (if requireScore) */}
                        {requireScore && (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Évaluation de la tâche <span className="text-orange-400">*</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setScore(star)}
                                            className={`p-1 transition ${star <= score ? "text-yellow-400" : "text-slate-200 hover:text-yellow-200"}`}
                                        >
                                            <Star size={24} fill={star <= score ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Note de {score} sur 10</p>
                            </div>
                        )}

                        {/* Info */}
                        {requireFiles && (
                            <div className="flex items-start gap-2.5 bg-orange-50 rounded-xl px-4 py-3">
                                <Info size={14} className="text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-orange-700 leading-relaxed">
                                    Joignez les livrables de la tâche pour valider le passage en révision.
                                </p>
                            </div>
                        )}
                        {requireScore && (
                            <div className="flex items-start gap-2.5 bg-orange-50 rounded-xl px-4 py-3">
                                <Info size={14} className="text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-orange-700 leading-relaxed">
                                    Une évaluation est requise pour marquer la tâche comme terminée.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-7 flex gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition text-[13px]"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm(comment.trim(), files, score)}
                            disabled={!canSubmit}
                            className="flex-1 py-3 rounded-2xl bg-[#f97316] text-white font-bold hover:opacity-90 transition text-[13px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
