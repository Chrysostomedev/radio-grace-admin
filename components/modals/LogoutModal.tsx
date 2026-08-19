"use client";

import { AlertTriangle } from "lucide-react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-[90%] max-w-lg rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-red-500" size={38} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Déconnexion de votre compte
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium px-4">
                        Souhaitez-vous vous déconnecter ? Vous pourrez vous reconnecter facilement à tout moment.
                    </p>
                </div>
                <div className="flex gap-4 w-full pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-6 rounded-2xl bg-[#f97316] text-white font-bold hover:opacity-90 transition-all"
                    >
                        Rester connecté
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-6 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}
