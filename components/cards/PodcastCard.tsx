"use client";
import { Edit2, Trash2, Play, Clock, Mic2, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Podcast {
  id: number;
  title?: string;
  titre?: string;
  category?: string;
  status?: "published" | "draft" | "archived";
  statut?: string;
  created_by?: string;
  created_at?: string;
  description?: string;
  image?: string;
  duration?: number;
  duree?: number;
  audio_url?: string;
  views_count?: number;
  likes_count?: number;
}

interface Props {
  podcast: Podcast;
  onEdit: (p: Podcast) => void;
  onDelete: (id: number) => void;
  onPlay?: (p: Podcast) => void;
  onClick?: (p: Podcast) => void;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  published: { label: "Publié", className: "bg-[#1E9D55] text-white ring-1 ring-white/10" },
  draft: { label: "Brouillon", className: "bg-[#F0A93E] text-[#0E241C] ring-1 ring-black/5" },
  archived: { label: "Archivé", className: "bg-white/15 text-white ring-1 ring-white/10" },
};

const CATEGORY_COLORS: Record<string, string> = {
  priere: "bg-[#1E5A3D]",
  jeunesse: "bg-[#1E9D55]",
  acclamez: "bg-[#F0A93E]",
  actualite: "bg-[#0E241C]",
  default: "bg-[#163A2C]",
};

export default function PodcastCard({ podcast, onEdit, onDelete, onPlay, onClick }: Props) {
  const [imgError, setImgError] = useState(false);
  const status = STATUS_STYLES[podcast.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.draft;
  const categoryColor = CATEGORY_COLORS[podcast.category || "default"] ?? CATEGORY_COLORS.default;
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      onClick={() => onClick?.(podcast)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-[#0E241C] ring-1 ring-black/5 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
      
      {/* IMAGE */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#163A2C] to-[#0E241C]">
        {podcast.image && !imgError ? (
          <Image
            src={podcast.image}
            alt={podcast.title || podcast.titre || "Podcast"}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${categoryColor}`}>
            <Mic2 size={40} strokeWidth={1.5} className="text-white/30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E241C] via-[#0E241C]/40 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Play Button + Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onPlay?.(podcast); }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F0A93E] text-[#0E241C] shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play size={20} fill="currentColor" />
          </button>
        </div>

        {/* Duration Badge */}
        {(podcast.duration || podcast.duree) && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
              <Clock size={11} /> {formatDuration(podcast.duration || podcast.duree)}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col bg-[#FAF7F0] p-4">
        
        {/* Title */}
        <h3 className="text-base font-bold leading-tight text-[#0E241C] line-clamp-2">
          {podcast.title || podcast.titre}
        </h3>

        {/* Category & Author */}
        <p className="mt-1.5 text-xs font-medium text-[#163A2C]/60">
          {podcast.category || "—"} • {podcast.created_by || "—"}
        </p>

        {/* Description */}
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#163A2C]/70 line-clamp-2">
          {podcast.description || "Podcast audio de Radio Grâce-Espoir"}
        </p>

        {/* Stats */}
        <div className="mt-3.5 flex items-center justify-between border-t border-[#163A2C]/10 pt-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#163A2C]/60">
            <span>👁️ {podcast.views_count ?? 0}</span>
            <span>❤️ {podcast.likes_count ?? 0}</span>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(podcast); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#163A2C]/10 text-[#163A2C] transition hover:bg-[#F0A93E] hover:text-[#0E241C]"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(podcast.id); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#163A2C]/10 text-[#163A2C] transition hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Color accent bar */}
      <div className={`h-1 w-full ${categoryColor} opacity-70 transition group-hover:opacity-100`} />
    </div>
  );
}
