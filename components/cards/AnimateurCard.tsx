"use client";

import { Edit2, Trash2, Eye, EyeOff, Radio } from "lucide-react";
import { useState } from "react";

interface Animateur {
  id: number;
  user_id: number;
  nom_scene: string;
  bio?: string;
  photo?: string;
  facebook?: string;
  whatsapp?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface AnimateurCardProps {
  animateur: Animateur;
  onClick: (animateur: Animateur) => void;
  onEdit: (animateur: Animateur) => void;
  onDelete: (id: number) => void;
}

export default function AnimateurCard({
  animateur,
  onClick,
  onEdit,
  onDelete,
}: AnimateurCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="group rounded-xl overflow-hidden bg-white border border-[#163A2C]/10 shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image */}
      <div
        className="relative w-full aspect-square bg-gradient-to-br from-[#163A2C] to-[#0E241C] cursor-pointer overflow-hidden"
        onClick={() => onClick(animateur)}
      >
        {animateur.photo ? (
          <img
            src={animateur.photo}
            alt={animateur.nom_scene}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Radio size={48} className="text-white/20" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <div
            className={`rounded-full p-2 ${
              animateur.is_visible
                ? "bg-[#1E9D55]/20 text-[#1E9D55]"
                : "bg-[#163A2C]/20 text-[#163A2C]"
            }`}
          >
            {animateur.is_visible ? (
              <Eye size={14} />
            ) : (
              <EyeOff size={14} />
            )}
          </div>
        </div>

        {/* Overlay actions */}
        {isHovering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(animateur);
              }}
              className="p-2 rounded-full bg-[#F0A93E] text-[#0E241C] hover:bg-[#E0972E] transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(animateur.id);
              }}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="p-4 space-y-2 cursor-pointer"
        onClick={() => onClick(animateur)}
      >
        <h3 className="font-bold text-[#0E241C] line-clamp-1">
          {animateur.nom_scene}
        </h3>
        {animateur.bio && (
          <p className="text-sm text-[#163A2C]/60 line-clamp-2">
            {animateur.bio}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          {animateur.facebook && (
            <a
              href={animateur.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#163A2C]/60 hover:text-[#F0A93E]"
              onClick={(e) => e.stopPropagation()}
            >
              Facebook
            </a>
          )}
          {animateur.whatsapp && (
            <a
              href={`https://wa.me/${animateur.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#163A2C]/60 hover:text-[#F0A93E]"
              onClick={(e) => e.stopPropagation()}
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
