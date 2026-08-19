"use client";

import { useState } from "react";
import {
    FileText, FileSpreadsheet, Image as ImageIcon,
    Download, Eye, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { resolveStorageUrl, fileExtension, fileName } from "@/lib/url";
import { formatDateFR } from "@/lib/format.data";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FileDocument {
    id: number;
    file_url: string;
    file_name?: string;
    created_at?: string;
    updated_at?: string;
}

interface FilePreviewGridProps {
    documents: FileDocument[];
    /** Titre de la section (par défaut "Pièces jointes") */
    title?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FILE_CONFIGS: Record<string, { icon: typeof FileText; color: string; bg: string; label: string }> = {
    pdf:  { icon: FileText,        color: "text-red-500",    bg: "bg-red-50",    label: "PDF" },
    doc:  { icon: FileText,        color: "text-blue-600",   bg: "bg-blue-50",   label: "Word" },
    docx: { icon: FileText,        color: "text-blue-600",   bg: "bg-blue-50",   label: "Word" },
    xls:  { icon: FileSpreadsheet, color: "text-green-600",  bg: "bg-green-50",  label: "Excel" },
    xlsx: { icon: FileSpreadsheet, color: "text-green-600",  bg: "bg-green-50",  label: "Excel" },
    png:  { icon: ImageIcon,       color: "text-purple-500", bg: "bg-purple-50", label: "Image" },
    jpg:  { icon: ImageIcon,       color: "text-purple-500", bg: "bg-purple-50", label: "Image" },
    jpeg: { icon: ImageIcon,       color: "text-purple-500", bg: "bg-purple-50", label: "Image" },
    gif:  { icon: ImageIcon,       color: "text-purple-500", bg: "bg-purple-50", label: "Image" },
    webp: { icon: ImageIcon,       color: "text-purple-500", bg: "bg-purple-50", label: "Image" },
    svg:  { icon: ImageIcon,       color: "text-purple-500", bg: "bg-purple-50", label: "Image" },
};

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);

function getFileConfig(ext: string) {
    return FILE_CONFIGS[ext] ?? { icon: FileText, color: "text-slate-500", bg: "bg-slate-50", label: ext.toUpperCase() || "Fichier" };
}

// ── Lightbox Modal ────────────────────────────────────────────────────────────

function Lightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
    const ext = fileExtension(url).toLowerCase();
    const isImage = IMAGE_EXTS.has(ext);
    const isOffice = ["doc", "docx", "xls", "xlsx"].includes(ext);

    let iframeSrc = url;
    if (isOffice) {
        // Embed via Google Docs Viewer for Office files
        iframeSrc = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onClose} />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{name}</p>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition">
                            <X size={18} />
                        </button>
                    </div>
                    {isOffice && (
                        <div className="bg-yellow-50 px-4 py-2 text-[11px] text-yellow-800 border-b border-yellow-100 flex justify-between items-center shrink-0">
                            <span>Google Docs Viewer est utilisé pour cet aperçu. Si le document est vide, c'est que votre serveur (ex: localhost) n'est pas accessible sur internet.</span>
                            <a href={url} target="_blank" rel="noreferrer" className="underline font-bold text-yellow-900 hover:text-black">
                                Ouvrir dans un nouvel onglet
                            </a>
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden bg-slate-50 flex items-center justify-center p-2 relative">
                        {isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={name} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                        ) : (
                            <iframe src={iframeSrc} className="w-full h-full border-0 rounded-lg shadow-sm" title={name} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ── File Card ─────────────────────────────────────────────────────────────────

function FileCard({ doc }: { doc: FileDocument }) {
    const [lightbox, setLightbox] = useState(false);

    const ext     = fileExtension(doc.file_url);
    const name    = doc.file_name ?? fileName(doc.file_url);
    const fullUrl = resolveStorageUrl(doc.file_url);
    const config  = getFileConfig(ext);
    const isImage = IMAGE_EXTS.has(ext);
    const Icon    = config.icon;

    return (
        <>
            {lightbox && <Lightbox url={fullUrl} name={name} onClose={() => setLightbox(false)} />}
            <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {/* Preview area */}
                <div className={`h-32 flex items-center justify-center ${config.bg} relative overflow-hidden`}>
                    {isImage ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={fullUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                }}
                            />
                            <div className="hidden flex-col items-center gap-1">
                                <Icon size={36} className={config.color} />
                                <span className="text-[10px] font-bold text-slate-400">{config.label}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-14 h-14 rounded-xl ${config.bg} border-2 border-white shadow-sm flex items-center justify-center`}>
                                <Icon size={28} className={config.color} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                                {config.label}
                            </span>
                        </div>
                    )}

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            onClick={() => setLightbox(true)}
                            className="w-9 h-9 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white transition shadow-sm"
                            title="Aperçu"
                        >
                            <Eye size={16} />
                        </button>
                        <a
                            href={fullUrl}
                            download
                            className="w-9 h-9 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white transition shadow-sm"
                            title="Télécharger"
                        >
                            <Download size={16} />
                        </a>
                    </div>
                </div>

                {/* File info */}
                <div className="px-3 py-2.5">
                    <p className="text-[12px] font-bold text-slate-800 truncate leading-tight" title={name}>
                        {name}
                    </p>
                    {doc.created_at && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatDateFR(doc.created_at)}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FilePreviewGrid({ documents, title = "Pièces jointes" }: FilePreviewGridProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-black text-slate-900 text-[14px]">
                {title}
                {documents.length > 0 && (
                    <span className="ml-1.5 text-slate-400 font-semibold text-[13px]">
                        ({documents.length})
                    </span>
                )}
            </h3>

            {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <FileText size={28} strokeWidth={1.5} />
                    <p className="text-[12px] mt-2 font-medium">Aucun document</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {documents.map((doc) => (
                        <FileCard key={doc.id} doc={doc} />
                    ))}
                </div>
            )}
        </div>
    );
}
