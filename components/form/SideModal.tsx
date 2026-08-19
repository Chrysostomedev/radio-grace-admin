"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface SideModalProps {
    isOpen:    boolean;
    onClose:   () => void;
    title:     string;
    subtitle?: string;
    children:  React.ReactNode;
    width?:    string; // ex: "max-w-xl"
}

export default function SideModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    width = "max-w-2xl",
}: SideModalProps) {
    // Fermer avec Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Bloquer le scroll body
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-stretch justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`relative z-[9999] w-full ${width} bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300`}>
                {/* Header */}
                <div className="flex items-start justify-between px-8 pt-8 pb-4 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-slate-400 font-medium mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700 shrink-0 ml-4"
                        aria-label="Fermer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
