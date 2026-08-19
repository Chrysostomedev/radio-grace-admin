"use client";
import { X, Eye, Heart, Share2, MessageSquare, Download, Clock, User, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PodcastDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "published" | "draft" | "archived";
  created_by: string;
  created_at: string;
  updated_at: string;
  image?: string;
  duration?: number;
  audio_url?: string;
  views_count?: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  downloads_count?: number;
}

interface Props {
  podcast: PodcastDetails;
  onClose: () => void;
  onArchive?: (id: number) => Promise<void>;
  onPublish?: (id: number) => Promise<void>;
}

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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const stats = [
    { icon: Eye, label: "Vues", value: podcast.views_count || 0 },
    { icon: Heart, label: "J'aime", value: podcast.likes_count || 0 },
    { icon: Share2, label: "Partages", value: podcast.shares_count || 0 },
    { icon: MessageSquare, label: "Commentaires", value: podcast.comments_count || 0 },
    { icon: Download, label: "Téléchargements", value: podcast.downloads_count || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">
        
        {/* Header avec image */}
        <div className="relative">
          {/* Image */}
          <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-[#163A2C] to-[#0E241C]">
            {podcast.image && !imgError ? (
              <Image
                src={podcast.image}
                alt={podcast.title}
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
            className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-[#0E241C] hover:bg-white backdrop-blur-sm"
          >
            <X size={20} />
          </button>

          {/* Status badge */}
          <div className="absolute bottom-4 left-4">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                podcast.status === "published"
                  ? "bg-[#1E9D55] text-white"
                  : podcast.status === "draft"
                  ? "bg-[#F0A93E] text-[#0E241C]"
                  : "bg-white/20 text-white"
              }`}
            >
              {podcast.status === "published"
                ? "Publié"
                : podcast.status === "draft"
                ? "Brouillon"
                : "Archivé"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* Title & Description */}
          <div>
            <h1 className="text-3xl font-bold text-[#0E241C]">{podcast.title}</h1>
            <p className="mt-2 text-[#163A2C]/70">{podcast.description || "Pas de description"}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                <Tag size={14} /> Catégorie
              </p>
              <p className="text-lg font-bold text-[#0E241C] capitalize">{podcast.category}</p>
            </div>

            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                <Clock size={14} /> Durée
              </p>
              <p className="text-lg font-bold text-[#0E241C]">{formatDuration(podcast.duration)}</p>
            </div>

            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                <User size={14} /> Auteur
              </p>
              <p className="text-lg font-bold text-[#0E241C]">{podcast.created_by}</p>
            </div>

            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                <Calendar size={14} /> Créé
              </p>
              <p className="text-lg font-bold text-[#0E241C]">
                {new Date(podcast.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#163A2C]/60 mb-1">
                <Calendar size={14} /> Modifié
              </p>
              <p className="text-lg font-bold text-[#0E241C]">
                {new Date(podcast.updated_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-[#0E241C]">Statistiques</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="rounded-lg bg-gradient-to-br from-[#F0A93E]/10 to-[#1E5A3D]/10 p-4 text-center">
                    <Icon size={24} className="mx-auto mb-2 text-[#F0A93E]" />
                    <p className="text-2xl font-bold text-[#0E241C]">{stat.value}</p>
                    <p className="text-xs text-[#163A2C]/60 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio URL */}
          {podcast.audio_url && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#0E241C]">Écouter</h3>
              <audio
                src={podcast.audio_url}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-[#163A2C]/10 pt-6 flex gap-3">
            {podcast.status === "draft" && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 rounded-lg bg-[#1E9D55] px-4 py-2.5 font-semibold text-white hover:bg-[#1A8A49] disabled:opacity-50"
              >
                {publishing ? "Publication..." : "Publier"}
              </button>
            )}
            {podcast.status === "published" && (
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
