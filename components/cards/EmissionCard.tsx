"use client";
import { Edit2, Trash2, MessageCircle, Users, Clock, Play, Calendar, Mic2 } from "lucide-react";
import { useState } from "react";

interface Emission {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: "active" | "pending" | "resolved" | "live" | "replay";
  created_by: string;
  created_date: string;
  messages_count?: number;
  participants?: string[];
  last_message?: string;
  last_updated: string;
  description?: string;
  image?: string;
  horaire?: string;
  animateur?: string;
}

interface Props {
  emission: Emission;
  onEdit: (e: Emission) => void;
  onDelete: (id: number) => void;
  onPlay?: (e: Emission) => void;
}

// Palette de marque (Radio Grâce-Espoir) — un accent par catégorie de programme
const CATEGORY_STYLES: Record<string, { gradient: string; badge: string; dot: string }> = {
  acclamez: { gradient: "from-[#F0A93E] to-[#C97F1E]", badge: "bg-[#F0A93E] text-[#0E241C]", dot: "bg-[#F0A93E]" },
  priere: { gradient: "from-[#1E5A3D] to-[#163A2C]", badge: "bg-[#1E5A3D] text-white", dot: "bg-[#1E5A3D]" },
  jeunesse: { gradient: "from-[#1E9D55] to-[#163A2C]", badge: "bg-[#1E9D55] text-white", dot: "bg-[#1E9D55]" },
  actualite: { gradient: "from-[#0E241C] to-[#163A2C]", badge: "bg-[#0E241C] text-white", dot: "bg-white/70" },
  default: { gradient: "from-[#163A2C] to-[#0E241C]", badge: "bg-white/90 text-[#163A2C]", dot: "bg-[#163A2C]" },
};

// Statut → couleur informative (au lieu d'un badge noir générique pour tout ce qui n'est pas "live")
const STATUS_STYLES: Record<Emission["status"], { label: string; className: string }> = {
  live: { label: "En direct", className: "bg-red-600 text-white ring-1 ring-red-300/40" },
  active: { label: "Actif", className: "bg-[#1E9D55] text-white ring-1 ring-white/10" },
  replay: { label: "Rediffusion", className: "bg-[#0E241C]/80 text-white ring-1 ring-white/10" },
  pending: { label: "En attente", className: "bg-[#F0A93E] text-[#0E241C] ring-1 ring-black/5" },
  resolved: { label: "Terminé", className: "bg-white/15 text-white ring-1 ring-white/10" },
};

export default function EmissionCard({ emission, onEdit, onDelete, onPlay }: Props) {
  const [imgError, setImgError] = useState(false);
  const style = CATEGORY_STYLES[emission.category] ?? CATEGORY_STYLES.default;
  const status = STATUS_STYLES[emission.status] ?? STATUS_STYLES.active;
const isLive = (emission as any).en_direct_maintenant || (emission as any).en_direct || emission.status === "live";
  return (
<div
  onClick={() => onPlay?.(emission)}
  className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] bg-[#0E241C] ring-1 ring-black/5 shadow-[0_6px_20px_rgba(14,36,28,0.10)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(14,36,28,0.28)]"
>
      {/* IMAGE / BANDEAU VISUEL */}
      <div className="relative h-64 w-full overflow-hidden">
        // (supprime l'import "next/image")
{emission.image && !imgError && !emission.image.match(/\.(mp4|webm|ogg)$/i) ? (
  <img
    src={emission.image}
    alt={emission.title}
    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    onError={() => setImgError(true)}
  />
) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${style.gradient}`}>
            <Mic2 size={44} strokeWidth={1.5} className="text-white/25" />
          </div>
        )}

        {/* Voiles de lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E241C] via-[#0E241C]/55 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />

        {/* Badges supérieurs */}
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md ${status.className}`}>
              {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
              {status.label}
            </span>
            {emission.horaire && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#163A2C] shadow-sm backdrop-blur-md">
                <Clock size={12} /> {emission.horaire}
              </span>
            )}
          </div>

          {/* Actions rapides — cibles tactiles 44px min */}
          <div className="flex translate-y-1 gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onPlay?.(emission); }}
              aria-label="Écouter"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#163A2C] shadow-md transition hover:bg-[#F0A93E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(emission); }}
              aria-label="Modifier"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-white hover:text-[#163A2C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(emission.id); }}
              aria-label="Supprimer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Titre incrusté */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${style.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {emission.category}
          </span>
          <h3 className="text-xl font-black leading-tight text-white drop-shadow-lg line-clamp-2 md:text-2xl">
            {emission.title}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-white/70">
            <Mic2 size={13} /> {emission.animateur ?? emission.created_by}
          </p>
        </div>
      </div>

      {/* CONTENU */}
      <div className="flex flex-1 flex-col bg-[#FAF7F0] p-5">
        <p className="min-h-[2.75rem] flex-1 text-sm leading-relaxed text-[#163A2C]/70 line-clamp-2">
          {emission.description ?? emission.last_message ?? "Émission phare de Radio Grâce-Espoir, l'Évangile au cœur de l'Homme."}
        </p>

        {/* Pied de carte */}
        <div className="mt-4 flex items-center justify-between border-t border-[#163A2C]/10 pt-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#163A2C]/5 px-2.5 py-1 text-xs font-bold text-[#163A2C]/70">
              <MessageCircle size={12} className="text-[#163A2C]/40" /> {emission.messages_count ?? 24}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#163A2C]/5 px-2.5 py-1 text-xs font-bold text-[#163A2C]/70">
              <Users size={12} className="text-[#163A2C]/40" /> {emission.participants?.length ?? 3}
            </span>
            {/* <span className="inline-flex items-center gap-1 rounded-full bg-[#163A2C]/5 px-2.5 py-1 text-xs font-bold text-[#163A2C]/70">
              <Calendar size={12} className="text-[#163A2C]/40" />
              {new Date(emission.last_updated).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
            </span> */}
          </div>
          <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-red-500 ring-4 ring-red-500/15 animate-pulse" : "bg-[#1E9D55] ring-4 ring-[#1E9D55]/10"}`} />
        </div>
      </div>

      {/* Liseré d'accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.gradient} opacity-80 transition group-hover:opacity-100`} />
    </div>
  );
}