"use client";

import {
  Edit2,
  Trash2,
  Eye,
  Heart,
  Bookmark,
  MessageCircle,
  Calendar,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Actualite {
  id: number;
  titre: string;
  image?: string | null;
  statut: string;
  importance?: string;
  vues?: number;
  likes?: number;
  favoris?: number;
  partages?: number;
  commentaires_count?: number;
  created_at: string;
  categorie?: { name: string } | null;
}

interface Props {
  actualite: Actualite;
  onEdit?: (a: Actualite) => void;
  onDelete?: (id: number) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PUBLIE: { label: "Publié", bg: "bg-[#1E9D55]/15", text: "text-[#1E5A3D]" },
  EN_COURS: { label: "En cours", bg: "bg-[#F0A93E]/15", text: "text-[#9A6A1E]" },
  BROUILLON: { label: "Brouillon", bg: "bg-slate-100", text: "text-slate-600" },
  RETARD: { label: "En retard", bg: "bg-red-100", text: "text-red-600" },
};

export default function ActualiteDetailCard({ actualite, onEdit, onDelete }: Props) {
  const router = useRouter();

  const status = STATUS_CONFIG[actualite.statut] ?? STATUS_CONFIG.BROUILLON;

  const getImageUrl = (img?: string | null) => {
    if (!img) return "/images/emission (3).jpg";
    if (img.startsWith("http")) return img;
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ??
      "http://127.0.0.1:8000";
    return `${base}/storage/${img.replace(/^\/?storage\//, "")}`;
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Barre accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#163A2C] to-[#F0A93E]" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#FBF6EA] border border-[#163A2C]/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(actualite.image)}
                alt={actualite.titre}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#163A2C] text-[15px] leading-tight line-clamp-2 group-hover:text-[#F0A93E] transition">
                {actualite.titre}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-[#163A2C]/50 mt-1 font-medium">
                <Calendar size={12} className="shrink-0" />
                <span>
                  {new Date(actualite.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(actualite);
                }}
                className="p-2 text-[#163A2C]/40 hover:text-[#F0A93E] hover:bg-[#F0A93E]/10 rounded-lg transition"
                title="Éditer"
              >
                <Edit2 size={15} strokeWidth={2.5} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(actualite.id);
                }}
                className="p-2 text-[#163A2C]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Supprimer"
              >
                <Trash2 size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className={`${status.bg} ${status.text} text-[10px] font-black px-2.5 py-1 rounded-full`}
          >
            {status.label}
          </span>

          {actualite.importance === "A_LA_UNE" && (
            <span className="text-[10px] font-black text-red-600 bg-red-100 px-2.5 py-1 rounded-full">
              À la une
            </span>
          )}

          {actualite.categorie?.name && (
            <span className="text-[10px] font-black text-[#163A2C] bg-[#FBF6EA] px-2.5 py-1 rounded-full border border-[#163A2C]/10">
              {actualite.categorie.name}
            </span>
          )}
        </div>

        {/* Stats likes / favoris / vues / commentaires */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-[#FBF6EA] px-2 py-2.5">
            <Eye size={14} className="text-[#163A2C]/40" />
            <p className="text-sm font-black text-[#163A2C]">{actualite.vues ?? 0}</p>
            <p className="text-[9px] font-bold text-[#163A2C]/40 uppercase">Vues</p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-xl bg-[#F0A93E]/10 px-2 py-2.5">
            <Heart size={14} className="text-[#E0972E]" />
            <p className="text-sm font-black text-[#9A6A1E]">{actualite.likes ?? 0}</p>
            <p className="text-[9px] font-bold text-[#9A6A1E]/70 uppercase">Likes</p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-xl bg-[#1E9D55]/10 px-2 py-2.5">
            <Bookmark size={14} className="text-[#1E5A3D]" />
            <p className="text-sm font-black text-[#1E5A3D]">{actualite.favoris ?? 0}</p>
            <p className="text-[9px] font-bold text-[#1E5A3D]/70 uppercase">Favoris</p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-xl bg-[#163A2C]/5 px-2 py-2.5">
            <MessageCircle size={14} className="text-[#163A2C]/50" />
            <p className="text-sm font-black text-[#163A2C]">
              {actualite.commentaires_count ?? 0}
            </p>
            <p className="text-[9px] font-bold text-[#163A2C]/40 uppercase">Comms</p>
          </div>
        </div>
      </div>
    </div>
  );
}