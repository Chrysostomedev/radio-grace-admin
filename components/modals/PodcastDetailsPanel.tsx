"use client";

import { X, Eye, MessageSquare, Clock, User, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Podcast, PodcastStatut } from "@/types/admin";

interface Props {
    podcast: Podcast;
    onClose: () => void;
    onArchive?: (id: number) => Promise<void>;
    onPublish?: (id: number) => Promise<void>;
}

/** Badge du statut de modération (avec fallback sur le statut FR) */
function resolveStatut(p: Podcast): PodcastStatut {
    if (p.status) return p.status;
    const s = p.statut?.toLowerCase() ?? "";
    if (s.startsWith("pub")) return "published";
    if (s.startsWith("arch")) return "archived";
    return "draft";
}

const STATUS_BADGES: Record<PodcastStatut, { label: string; className: string }> = {
    published: { label: "Publié", className: "bg-[#1E9D55] text-white" },
    draft: { label: "Brouillon", className: "bg-[#F0A93E] text-[#0E241C]" },
    archived: { label: "Archivé", className: "bg-white/20 text-white" },
};

const formatDate = (dateStr?: string): string =>
    dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "—";

const formatDuration = (seconds?: number | null): string => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `hoursh{hours}hhoursh{mins}m secss‘:‘{secs}s` : `secss‘:‘{mins}m ${secs}s`;
};

/** Préfixe /storage/ pour les chemins locaux */
const mediaUrl = (url: string): string =>
    url.startsWith("http") ? url : `/storage/${url}`;

export default function PodcastDetailsPanel({ podcast, onClose, onArchive, onPublish }: Props) {
    const [imgError, setImgError] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const handleArchive = async () => {
        if (!onArchive) return;
        setArchiving(true);
        try {
            await onArchive(podcast.id);
        } finally {
            setArchiving(false);
        }
    };

    const handlePublish = async () => {
        if (!onPublish) return;
        setPublishing(true);
        try {
            await onPublish(podcast.id);
        } finally {
            setPublishing(false);
        }
    };

    const statut = resolveStatut(podcast);
    const badge = STATUS_BADGES[statut];

    const stats = [
        { icon: Eye, label: "Vues", value: podcast.vues ?? 0 },
        { icon: MessageSquare, label: "Commentaires", value: podcast.commentaires_count ?? 0 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">

                {/* Header avec image */}
                <div className="relative">
                    <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-[#163A2C] to-[#0E241C]">
                        {podcast.image && !imgError ? (
                            <Image
                                src={mediaUrl(podcast.image)}
                                alt={podcast.titre}
                                fill
                                className="object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <MessageSquare size={80} className="text-white/10" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E241C] via-[#0E241C]/40 to-transparent" />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-[#0E241C] hover:bg-white backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>

                    {/* Status badge */}
                    <div className="absolute bottom-4 left-4">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${badge.className}`}
                        >
                            {badge.label}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-3xl font-bold text-[#0E241C]">{podcast.titre}</h1>
                        <p className="mt-2 text-[#163A2C]/70">{podcast.description || "Pas de description"}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                                <Tag size={14} /> Programme
                            </p>
                            <p className="text-lg font-bold text-[#0E241C]">
                                {podcast.programme?.titre ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                                <Clock size={14} /> Durée
                            </p>
                            <p className="text-lg font-bold text-[#0E241C]">
                                {podcast.duree_formatee || formatDuration(podcast.duree ?? undefined)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                                <User size={14} /> Animateur
                            </p>
                            <p className="text-lg font-bold text-[#0E241C]">
                                {podcast.programme?.animateur?.nom_scene ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                                <Calendar size={14} /> Créé
                            </p>
                            <p className="text-lg font-bold text-[#0E241C]">
                                {formatDate(podcast.created_at)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                                <Calendar size={14} /> Modifié
                            </p>
                            <p className="text-lg font-bold text-[#0E241C]">
                                {formatDate(podcast.updated_at)}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div>
                        <h2 className="mb-4 text-lg font-bold text-[#0E241C]">Statistiques</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="rounded-lg bg-gradient-to-br from-[#F0A93E]/10 to-[#1E5A3D]/10 p-4 text-center"
                                    >
                                        <Icon size={24} className="mx-auto mb-2 text-[#F0A93E]" />
                                        <p className="text-2xl font-bold text-[#0E241C]">{stat.value}</p>
                                        <p className="text-xs text-[#163A2C]/60 mt-1">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Lecteur audio */}
                    {podcast.audio_url && (
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-[#0E241C]">Écouter</h3>
                            <audio
                                src={mediaUrl(podcast.audio_url)}
                                controls
                                className="w-full rounded-lg"
                            />
                        </div>
                    )}

                    {/* Vidéo externe (lien) */}
                    {podcast.video_url?.startsWith("http") && (
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-[#0E241C]">Vidéo</h3>
                            <a
                                href={podcast.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-[#1E5A3D] underline hover:text-[#F0A93E]"
                            >
                                Ouvrir la vidéo
                            </a>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-[#163A2C]/10 pt-6 flex gap-3">
                        {statut === "draft" && (
                            <button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="flex-1 rounded-lg bg-[#1E9D55] px-4 py-2.5 font-semibold text-white hover:bg-[#1A8A49] disabled:opacity-50"
                            >
                                {publishing ? "Publication..." : "Publier"}
                            </button>
                        )}
                        {statut === "published" && (
                            <button
                                onClick={handleArchive}
                                disabled={archiving}
                                className="flex-1 rounded-lg bg-[#F0A93E] px-4 py-2.5 font-semibold text-[#0E241C] hover:bg-[#E0972E] disabled:opacity-50"
                            >
                                {archiving ? "Archivage..." : "Archiver"}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-[#163A2C]/10 px-4 py-2.5 font-semibold text-[#0E241C] hover:bg-[#FFFBF0]"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
