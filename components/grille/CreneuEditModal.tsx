"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Clock } from "lucide-react";
import type { ProgrammeGrille, Programme, Jour } from "@/types/admin";

interface CreneuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  creneau: ProgrammeGrille | null;
  programmes: Programme[];
  onSave: (data: any) => Promise<void>;
  onDelete: () => void;
}

const HEURES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const JOURS: Jour[] = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE", "TOUS"];

export default function CreneuEditModal({
  isOpen,
  onClose,
  creneau,
  programmes,
  onSave,
  onDelete,
}: CreneuEditModalProps) {
  const [jour, setJour] = useState<Jour>(creneau?.jour || "LUNDI");
  const [heureDebut, setHeureDebut] = useState(creneau?.heure_debut?.substring(0, 5) || "08:00");
  const [heureFin, setHeureFin] = useState(creneau?.heure_fin?.substring(0, 5) || "09:00");
  const [isRediffusion, setIsRediffusion] = useState(creneau?.is_rediffusion || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedProgramme = programmes.find((p) => p.id === creneau?.programme_id);

  useEffect(() => {
    if (creneau) {
      setJour(creneau.jour);
      setHeureDebut(creneau.heure_debut?.substring(0, 5) || "08:00");
      setHeureFin(creneau.heure_fin?.substring(0, 5) || "09:00");
      setIsRediffusion(creneau.is_rediffusion || false);
      setError("");
    }
  }, [creneau, isOpen]);

  if (!isOpen || !creneau || !selectedProgramme) return null;

  const handleSubmit = async () => {
    setError("");

    if (heureDebut >= heureFin) {
      setError("L'heure de fin doit être après l'heure de début");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        jour,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        is_rediffusion: isRediffusion,
      });
      onClose();
    } catch (err) {
      // Erreur gérée par onSave
    } finally {
      setSubmitting(false);
    }
  };

  const durée = calculateDuration(heureDebut, heureFin);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[9999] p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-black text-[#163A2C]">Modifier</h2>
            <p className="text-sm text-[#163A2C]/60 mt-1">{selectedProgramme.titre}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#163A2C]/10 rounded-lg">
            <X size={20} className="text-[#163A2C]" />
          </button>
        </div>

        {/* Émission */}
        <div className="mb-4 p-3 rounded-xl bg-[#F0A93E]/10 border border-[#F0A93E]/30 flex gap-3">
          <img
            src={selectedProgramme.image || "/images/emission-default.jpg"}
            alt={selectedProgramme.titre}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="text-sm flex-1">
            <p className="font-bold text-[#163A2C]">{selectedProgramme.titre}</p>
            <p className="text-[#163A2C]/60 text-xs">
              {selectedProgramme.animateur?.nom_scene || "—"}
            </p>
          </div>
        </div>

        {/* Jour */}
        <div className="mb-4">
          <label className="block text-xs font-black text-[#163A2C]/60 uppercase mb-2">
            Jour
          </label>
          <select
            value={jour}
            onChange={(e) => setJour(e.target.value as Jour)}
            className="w-full px-3 py-2 border border-[#163A2C]/20 rounded-lg focus:outline-none focus:border-[#F0A93E] text-sm"
          >
            {JOURS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* Heures */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-black text-[#163A2C]/60 uppercase mb-2">
              Début
            </label>
            <select
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="w-full px-3 py-2 border border-[#163A2C]/20 rounded-lg focus:outline-none focus:border-[#F0A93E] text-sm"
            >
              {HEURES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-[#163A2C]/60 uppercase mb-2">
              Fin
            </label>
            <select
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="w-full px-3 py-2 border border-[#163A2C]/20 rounded-lg focus:outline-none focus:border-[#F0A93E] text-sm"
            >
              {HEURES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Durée info */}
        <div className="mb-4 p-2 rounded-lg bg-[#163A2C]/5 flex items-center gap-2 text-sm">
          <Clock size={14} className="text-[#163A2C]" />
          <span className="font-bold text-[#163A2C]">{durée}</span>
        </div>

        {/* Rediffusion */}
        <label className="mb-4 flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#163A2C]/5 transition">
          <input
            type="checkbox"
            checked={isRediffusion}
            onChange={(e) => setIsRediffusion(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-sm font-bold text-[#163A2C]">Rediffusion</span>
        </label>

        {/* Erreur */}
        {error && (
          <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 font-bold">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-[#163A2C]/10">
          <button
            onClick={() => onDelete()}
            className="p-2 hover:bg-red-500/10 rounded-lg transition"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-[#163A2C]/10 text-[#163A2C] rounded-lg font-bold text-sm hover:bg-[#163A2C]/20 transition"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-3 py-2 bg-[#F0A93E] text-[#163A2C] rounded-lg font-bold text-sm hover:bg-[#E0972E] transition disabled:opacity-50"
          >
            {submitting ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </>
  );
}

function calculateDuration(debut: string, fin: string): string {
  const [hd, md] = debut.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  const minutes = hf * 60 + mf - (hd * 60 + md);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}`;
}