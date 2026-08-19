"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, Mic, Image as ImageIcon } from "lucide-react";

interface MessageSendProps {
    /** Tabs : ex ["Commentaire","E-mail"] */
    tabs?:        string[];
    placeholder?: string;
    onSend?:      (message: string, tab: string, files: File[]) => Promise<void> | void;
    disabled?:    boolean;
}

export default function MessageSend({
    tabs        = ["Commentaire", "E-mail"],
    placeholder = "Commencer à écrire votre commentaire",
    onSend,
    disabled    = false,
}: MessageSendProps) {
    const [activeTab, setActiveTab] = useState(tabs[0] ?? "Commentaire");
    const [value,     setValue]     = useState("");
    const [sending,   setSending]   = useState(false);
    const [files,     setFiles]     = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if (!value.trim() && files.length === 0) return;
        setSending(true);
        try {
            await onSend?.(value.trim(), activeTab, files);
            setValue("");
            setFiles([]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles((prev) => [...prev, ...selected]);
        e.target.value = "";
    };

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-[13px] font-bold transition-colors relative ${
                            activeTab === tab
                                ? "text-slate-900"
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316] rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Textarea */}
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || sending}
                rows={3}
                className="w-full px-4 pt-3 pb-1 text-[13px] text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none disabled:opacity-50 bg-white"
            />

            {/* Fichiers attachés */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                    {files.map((f, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600"
                        >
                            <Paperclip size={11} />
                            <span className="max-w-[120px] truncate">{f.name}</span>
                            <button
                                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                className="text-slate-400 hover:text-red-500 transition ml-1"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                    {/* Pièce jointe */}
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={disabled}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition disabled:opacity-40"
                        title="Joindre un fichier"
                        type="button"
                    >
                        <Paperclip size={16} />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* Image */}
                    <button
                        disabled={disabled}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition disabled:opacity-40"
                        title="Joindre une image"
                        type="button"
                    >
                        <ImageIcon size={16} />
                    </button>

                    {/* Audio */}
                    <button
                        disabled={disabled}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition disabled:opacity-40"
                        title="Message vocal"
                        type="button"
                    >
                        <Mic size={16} />
                    </button>
                </div>

                {/* Envoyer */}
                <button
                    onClick={handleSend}
                    disabled={disabled || sending || (!value.trim() && files.length === 0)}
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center text-white hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Envoyer"
                >
                    <Send size={14} strokeWidth={2.5} className="translate-x-px" />
                </button>
            </div>
        </div>
    );
}
