"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProgrammes } from "@/hooks/admin/useProgrammes";
import { useToast } from "@/context/ToastContext";
import { programmeGrillesService } from "@/services/admin/programme-grilles.service";
import GrilleBoard from "@/components/grille/GrilleBoard";
import ProgrammesSidebar from "@/components/grille/ProgrammesSidebar";
import CreneuEditModal from "@/components/grille/CreneuEditModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import type { ProgrammeGrille } from "@/types/admin";

const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

export default function GrillePage() {
  const toast = useToast();
  const { programmes, loading: loadingProgrammes } = useProgrammes();

  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [creneaux, setCreneaux] = useState<ProgrammeGrille[]>([]);
  const [selectedCreneau, setSelectedCreneau] = useState<ProgrammeGrille | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);

  // State pour le programme sélectionné (sert au drag & drop + au <select>, plus au fetch)
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<number | null>(null);

  // Filtrer les programmes valides (EMISSION, pas PUB/SPOT)
  const validProgrammes = programmes?.filter(p =>
    p.categorie && ["ACCLAMEZ", "PRIERE", "JEUNESSE", "ACTUALITE", "MUSIQUE"].includes(p.categorie)
  ) ?? [];

  // Initialiser le premier programme seulement si pas déjà sélectionné
  useEffect(() => {
    if (validProgrammes?.length > 0 && !selectedProgrammeId) {
      setSelectedProgrammeId(validProgrammes[0].id);
    }
  }, [validProgrammes, selectedProgrammeId]);

  // Charger TOUTE la grille (tous programmes confondus) — un seul point de vérité
  const chargerCreneaux = useCallback(async () => {
    setLoadingCreneaux(true);
    try {
      const data = await programmeGrillesService.getAllGrille();
      setCreneaux(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error("Erreur chargerCreneaux:", err);
      toast.error(err.errorMessage || "Impossible de charger la grille", "Erreur");
    } finally {
      setLoadingCreneaux(false);
    }
  }, [toast]);

  // Un seul déclenchement, au montage. Ne dépend plus de selectedProgrammeId.
  useEffect(() => {
    chargerCreneaux();
  }, [chargerCreneaux]);

  const handlePreviousWeek = () => setWeekStart(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  const handleNextWeek = () => setWeekStart(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000));

  const handleDropOnSlot = async (jour: string, heure: string, programme: any) => {
    try {
      if (!programme || typeof programme.id !== "number") {
        toast.error("Émission invalide", "Erreur");
        return;
      }
      if (programme.id !== selectedProgrammeId) {
        toast.error(
          `Sélectionnez d'abord "${programme.titre}" dans le menu Émission avant de le placer sur la grille`,
          "Émission différente"
        );
        return;
      }

      const payload = {
        jour,
        heure_debut: heure,
        heure_fin: addHour(heure),
        is_rediffusion: false,
      };

      await programmeGrillesService.create(programme.id, payload);
      toast.success("Créneau créé", "Succès");
      chargerCreneaux();
    } catch (err: any) {
      console.error("Drop error:", err);
      const errorMsg = err.errors
        ? err.errors[Object.keys(err.errors)[0]]?.[0]
        : err.errorMessage;
      toast.error(errorMsg || "Erreur lors de la création", "Conflit");
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!selectedCreneau) return;
    try {
      await programmeGrillesService.update(selectedCreneau.id, data);
      toast.success("Créneau modifié", "Succès");
      chargerCreneaux();
      setShowEdit(false);
      setSelectedCreneau(null);
    } catch (err: any) {
      console.error("Save edit error:", err);
      const errorMsg = err.errors
        ? err.errors[Object.keys(err.errors)[0]]?.[0]
        : err.errorMessage;
      toast.error(errorMsg || "Erreur lors de la modification", "Erreur");
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedCreneau) return;
    try {
      await programmeGrillesService.delete(selectedCreneau.id);
      toast.success("Créneau supprimé", "Succès");
      chargerCreneaux();
      setShowDelete(false);
      setShowEdit(false);
      setSelectedCreneau(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      const errorMsg = err.errorMessage || "Erreur lors de la suppression";
      toast.error(errorMsg, "Erreur");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-[calc(100vh-160px)] overflow-hidden bg-[#FBF6EA]">
      {/* Sidebar des émissions - hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block w-72">
        {loadingProgrammes ? (
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-6 flex items-center justify-center h-full text-[#163A2C]/40 text-sm">
            Chargement des émissions...
          </div>
        ) : validProgrammes?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-6 flex items-center justify-center h-full text-center">
            <p className="text-[#163A2C]/60 text-sm font-medium">Aucune émission disponible</p>
          </div>
        ) : (
          <ProgrammesSidebar
            programmes={validProgrammes}
            loading={false}
            onDropSlot={handleDropOnSlot}
          />
        )}
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 px-4 lg:px-6 py-3 lg:py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
          <div className="flex-1">
            <p className="text-[10px] lg:text-xs text-[#163A2C]/60 font-bold uppercase">Semaine</p>
            <p className="text-base lg:text-lg font-black text-[#163A2C]">
              {formatDateRange(weekStart)}
            </p>
          </div>

          {/* Sélecteur d'émission (mobile + desktop) */}
          {validProgrammes?.length > 0 && (
            <div className="w-full lg:w-auto flex items-center gap-2">
              <label htmlFor="programme-select" className="text-xs text-[#163A2C]/60 font-bold uppercase whitespace-nowrap">
                Émission:
              </label>
              <select
                id="programme-select"
                value={selectedProgrammeId || ""}
                onChange={(e) => setSelectedProgrammeId(Number(e.target.value))}
                className="flex-1 lg:flex-none px-3 py-2 text-sm border border-[#163A2C]/10 rounded-lg bg-white text-[#163A2C] focus:outline-none focus:ring-2 focus:ring-[#163A2C]/20"
              >
                {validProgrammes.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.titre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1 lg:gap-2">
            <button onClick={handlePreviousWeek} className="p-1.5 lg:p-2 hover:bg-[#163A2C]/5 rounded-xl transition">
              <ChevronLeft size={16} className="lg:w-5 lg:h-5 text-[#163A2C]" />
            </button>
            <div className="text-center text-xs px-2">
              <p className="text-[#163A2C]/40 font-bold">W{getWeekNumber(weekStart)}</p>
            </div>
            <button onClick={handleNextWeek} className="p-1.5 lg:p-2 hover:bg-[#163A2C]/5 rounded-xl transition">
              <ChevronRight size={16} className="lg:w-5 lg:h-5 text-[#163A2C]" />
            </button>
          </div>
        </div>

        {/* Grille */}
        <div className="flex-1 bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden flex flex-col min-h-0">
          {loadingCreneaux || loadingProgrammes ? (
            <div className="flex items-center justify-center h-full text-[#163A2C]/40 text-sm">
              Chargement de la grille...
            </div>
          ) : (
            <GrilleBoard
              jours={JOURS}
              creneaux={creneaux}
              programmes={programmes ?? []}
              weekStart={weekStart}
              onDropSlot={handleDropOnSlot}
              onCreneuClick={(creneau: ProgrammeGrille) => {
                setSelectedCreneau(creneau);
                setShowEdit(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Modal édition */}
      <CreneuEditModal
        isOpen={showEdit}
        onClose={() => {
          setShowEdit(false);
          setSelectedCreneau(null);
        }}
        creneau={selectedCreneau}
        programmes={programmes}
        onSave={handleSaveEdit}
        onDelete={() => setShowDelete(true)}
      />

      {/* Modal suppression */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteSlot}
        title="Supprimer le créneau"
        message={`Supprimer « ${selectedCreneau?.programme?.titre || "ce créneau"} » ?`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}

// Utilitaires
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = day === 0 ? -6 : 1 - day; // Jours à soustraire pour arriver au lundi
  return new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
}

function formatDateRange(start: Date): string {
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function addHour(heure: string): string {
  const [h, m] = heure.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}