"use client";

import { useState } from "react";
import { Search, Radio } from "lucide-react";
import type { Programme } from "@/types/admin";

interface ProgrammesSidebarProps {
  programmes: Programme[];
  loading: boolean;
  onDropSlot: (jour: string, heure: string, programme: Programme) => void;
}

export default function ProgrammesSidebar({
  programmes,
  loading,
  onDropSlot,
}: ProgrammesSidebarProps) {
  const [search, setSearch] = useState("");
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const filtered = programmes.filter((p) =>
    p.titre.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, programme: Programme) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("programme", JSON.stringify(programme));
    setDraggedId(programme.id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="w-72 bg-white rounded-2xl border border-[#163A2C]/10 p-4 flex flex-col max-h-[calc(100vh-160px)] overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-black text-[#163A2C] mb-3 flex items-center gap-2 uppercase">
          <Radio size={14} /> Émissions
        </h2>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#163A2C]/30" />
          <input
            type="text"
            placeholder="Chercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:border-[#F0A93E] text-xs"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {loading ? (
          <div className="py-6 text-center text-[#163A2C]/40 text-xs">
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-6 text-center text-[#163A2C]/40 text-xs">
            Aucune émission
          </div>
        ) : (
          filtered.map((programme) => (
            <div
              key={programme.id}
              draggable
              onDragStart={(e) => handleDragStart(e, programme)}
              onDragEnd={handleDragEnd}
              className={`p-2 rounded-lg border-2 border-dashed transition cursor-move group ${
                draggedId === programme.id
                  ? "border-[#F0A93E] bg-[#F0A93E]/10 opacity-50"
                  : "border-[#163A2C]/20 bg-white hover:border-[#F0A93E]/50 hover:bg-[#F0A93E]/5"
              }`}
            >
              {/* Image */}
              <div className="w-full h-14 rounded-lg overflow-hidden bg-[#FBF6EA] mb-2 relative">
                <img
                  src={programme.image || "/images/emission-default.jpg"}
                  alt={programme.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </div>

              {/* Infos */}
              <p className="font-bold text-[#163A2C] line-clamp-2 text-xs leading-tight">
                {programme.titre}
              </p>
              <p className="text-[10px] text-[#163A2C]/50 mt-1">
                {programme.animateur?.nom_scene || "—"}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[9px] bg-[#163A2C]/10 text-[#163A2C] px-1 py-0.5 rounded font-bold uppercase">
                  {programme.categorie}
                </span>
                {programme.statut === "EN_DIRECT" && (
                  <span className="text-[9px] bg-red-500/20 text-red-600 px-1 py-0.5 rounded font-bold animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#163A2C]/10 text-[10px] text-[#163A2C]/50 text-center">
        {filtered.length} émission{filtered.length !== 1 ? "s" : ""}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #163A2C; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
