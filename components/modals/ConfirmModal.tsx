"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmation",
    message = "Êtes-vous sûr de vouloir effectuer cette action ?",
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-[90%] max-w-md rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-[#f97316]" size={28} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-2xl bg-[#f97316] text-white font-bold hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isLoading ? "..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
