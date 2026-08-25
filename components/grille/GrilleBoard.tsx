"use client";

import { useState } from "react";
import type { ProgrammeGrille, Programme } from "@/types/admin";

interface GrilleBoardProps {
  jours: string[];
  creneaux: ProgrammeGrille[];
  programmes: Programme[];
  weekStart: Date;
  onDropSlot: (jour: string, heure: string, programme: any) => void;
  onCreneuClick: (creneau: ProgrammeGrille) => void;
}

const HEURES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function calculateDuration(heure_debut: string, heure_fin: string): string {
  const start = timeToMinutes(heure_debut);
  const end = timeToMinutes(heure_fin);
  const diff = end - start;

  if (diff < 0) return "0h";

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}`;
}

function creneauCouvreHeure(creneau: ProgrammeGrille, heure: string): boolean {
  if (!creneau.heure_debut || !creneau.heure_fin) return false;

  const creneauStart = timeToMinutes(creneau.heure_debut);
  const creneauEnd = timeToMinutes(creneau.heure_fin);
  const heureStart = timeToMinutes(heure);
  const heureEnd = heureStart + 60;

  return creneauStart < heureEnd && creneauEnd > heureStart;
}

function isFirstHourOfCreneau(creneau: ProgrammeGrille, heure: string): boolean {
  return creneau.heure_debut?.startsWith(heure.substring(0, 2)) || false;
}

function calculateCreneuHeight(creneau: ProgrammeGrille): number {
  if (!creneau.heure_debut || !creneau.heure_fin) return 80;

  const start = timeToMinutes(creneau.heure_debut);
  const end = timeToMinutes(creneau.heure_fin);
  const diff = end - start;

  return Math.max(20, (diff / 60) * 80);
}

export default function GrilleBoard({
  jours,
  creneaux,
  programmes,
  weekStart,
  onDropSlot,
  onCreneuClick,
}: GrilleBoardProps) {
  const [dragover, setDragover] = useState<string | null>(null);

  // Sécurise contre programmes undefined pendant le chargement
  const safeProgrammes = programmes ?? [];

  // Programme fallback pour les cases vides (ex: "L'Heure de Grâce")
  const defaultProgramme = safeProgrammes.find((p) => (p as Record<string, any>).is_default) ?? null;

  const getCreneau = (jour: string, heure: string) => {
    return creneaux.find(
      (c) => c.jour === jour && creneauCouvreHeure(c, heure)
    );
  };

  const getProgramme = (id: number) => safeProgrammes.find((p) => p.id === id);

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragover(slotId);
  };

  const handleDragLeave = () => {
    setDragover(null);
  };

  const handleDrop = (e: React.DragEvent, jour: string, heure: string) => {
    e.preventDefault();
    setDragover(null);

    try {
      const data = e.dataTransfer.getData("programme");
      if (data) {
        const programme = JSON.parse(data);
        if (programme && programme.id) {
          onDropSlot(jour, heure, programme);
        }
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-white to-[#FBF6EA]/30">
      {/* Sticky header - Jours */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#163A2C]/10">
        <div className="flex">
          <div className="w-16 bg-white p-2" />
          {jours.map((jour) => (
            <div
              key={jour}
              className="flex-1 min-w-[120px] p-3 text-center border-l border-[#163A2C]/10"
            >
              <p className="text-xs font-black text-[#163A2C] uppercase">{jour.substring(0, 3)}</p>
              <p className="text-[10px] text-[#163A2C]/60 mt-1">
                {getDateForDay(weekStart, jours.indexOf(jour))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div className="flex">
        {/* Colonne heures */}
        <div className="w-16 bg-[#FBF6EA] border-r border-[#163A2C]/10">
          {HEURES.map((heure, idx) => (
            <div
              key={heure}
              className={`h-20 flex items-center justify-center border-b border-[#163A2C]/5 ${
                idx % 2 === 0 ? "bg-white" : "bg-[#FBF6EA]"
              }`}
            >
              <p className="text-[10px] font-bold text-[#163A2C]/70">{heure}</p>
            </div>
          ))}
        </div>

        {/* Grille jours × heures */}
        {jours.map((jour) => (
          <div key={jour} className="flex-1 min-w-[120px] border-r border-[#163A2C]/10">
            {HEURES.map((heure, idx) => {
              const slotId = `${jour}-${heure}`;
              const creneau = getCreneau(jour, heure);
              const programme = creneau ? getProgramme(creneau.programme_id) : null;
              const isHover = dragover === slotId;
              const isFirstHour = creneau ? isFirstHourOfCreneau(creneau, heure) : false;
              const creneauHeight = creneau ? calculateCreneuHeight(creneau) : 80;
              const duration = creneau ? calculateDuration(creneau.heure_debut || "", creneau.heure_fin || "") : "";

              // Pour éviter d'afficher le créneau plusieurs fois, on ne l'affiche qu'à sa première heure
              if (creneau && !isFirstHour) {
                return (
                  <div
                    key={slotId}
                    className={`h-20 border-b border-[#163A2C]/5 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#FBF6EA]/50"
                    }`}
                  />
                );
              }

              return (
                <div
                  key={slotId}
                  className={`border-b border-[#163A2C]/5 flex items-center justify-center p-1 transition-all ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#FBF6EA]/50"
                  } ${
                    isHover
                      ? "bg-[#F0A93E]/20 ring-2 ring-[#F0A93E]"
                      : ""
                  }`}
                  style={{
                    height: creneau && isFirstHour ? `${creneauHeight}px` : "80px",
                  }}
                  onDragOver={(e) => handleDragOver(e, slotId)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, jour, heure)}
                >
                  {creneau && programme && isFirstHour ? (
                    <button
                      onClick={() => onCreneuClick(creneau)}
                      className="group relative w-full h-full flex flex-col items-center justify-start p-2 rounded-lg bg-gradient-to-br from-[#F0A93E]/30 to-[#F0A93E]/10 border border-[#F0A93E]/40 hover:border-[#F0A93E] hover:shadow-md transition-all"
                      title={`${programme.titre} - ${creneau.heure_debut} à ${creneau.heure_fin}`}
                    >
                      {/* Image en haut */}
                      <div
                        className="w-10 h-10 rounded-full shadow-sm border border-[#F0A93E] overflow-hidden bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: programme.image ? `url(${programme.image})` : `url('/images/emission-default.jpg')`,
                        }}
                      />

                      {/* Texte : titre + heure + durée */}
                      <div className="mt-1 text-center w-full min-w-0">
                        <p className="text-[11px] font-bold text-[#163A2C] truncate line-clamp-2">
                          {programme.titre}
                        </p>
                        <p className="text-[9px] text-[#163A2C]/70 font-semibold">
                          {creneau.heure_debut} {duration && `(${duration})`}
                        </p>
                      </div>

                      {/* Badge rediffusion */}
                      {creneau.is_rediffusion && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F0A93E] rounded-full flex items-center justify-center text-[9px] text-white font-bold shadow-md">
                          R
                        </div>
                      )}
                    </button>
                  ) : !creneau && defaultProgramme ? (
                    // Case vide : affichage du programme par défaut ("L'Heure de Grâce")
                    <div
                      className="w-full h-full flex flex-col items-center justify-start p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-dashed border-gray-300 opacity-70"
                      title={`${defaultProgramme.titre} (par défaut)`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden bg-cover bg-center flex-shrink-0 grayscale"
                        style={{
                          backgroundImage: defaultProgramme.image
                            ? `url(${defaultProgramme.image})`
                            : `url('/images/emission-default.jpg')`,
                        }}
                      />
                      <div className="mt-1 text-center w-full min-w-0">
                        <p className="text-[10px] font-semibold text-gray-500 truncate">
                          {defaultProgramme.titre}
                        </p>
                      </div>
                    </div>
                  ) : (
                    !creneau && (
                      <div className="text-[#163A2C]/20 text-[12px] font-bold opacity-0 hover:opacity-50 transition">
                        +
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getDateForDay(base: Date, dayIndex: number): string {
  const date = new Date(base.getTime() + dayIndex * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("fr-FR", { day: "2-digit" });
}