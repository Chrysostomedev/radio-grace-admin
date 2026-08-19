"use client";

// ============================================================
// components/MainCard.tsx
// Version 100% mockée, thème orange-500, zéro dépendance API
// Reçoit les plannings réels depuis PlanningPage via props
// ============================================================

import { useState } from "react";
import SearchInput from "../data/SearchInput";
import EventLegend from "../sections/EventLegend";
import CalendarGrid from "../sections/CalendarGrid";
import MiniCalendar from "../sections/MiniCalendar";
import SideDetailsPanel from "../modals/SidePanel";
import DataTable from "../data/DataTable";
import { LayoutGrid, List, X, ChevronRight } from "lucide-react";

// ─── Types locaux pour découpler du service API ───────────────
type PlanningStatus = "PLANIFIÉ" | "EN_COURS" | "EN_RETARD" | "RÉALISÉ";

interface Planning {
  id: number;
  codification: string;
  date_debut: string;
  date_fin: string;
  status: PlanningStatus;
  responsable_name: string;
  site?: { id: number; nom: string };
  provider?: { id: number; company_name?: string; user?: { first_name: string; last_name: string } };
}

interface DetailField {
  label: string;
  value: string;
  isStatus?: boolean;
  statusColor?: string;
}

interface FormattedEvent {
  title: string;
  reference?: string;
  description?: string;
  fields: DetailField[];
}

interface MainCardProps {
  plannings: Planning[];
  isLoading?: boolean;
  selectedEvent: FormattedEvent | null;
  isPanelOpen: boolean;
  onEventClick: (planning: Planning) => void;
  onPanelClose: () => void;
  onEditClick: () => void;
  onEventDrop?: (planningId: number, newDate: Date) => void;
  onDeleteClick?: () => void;
  canAddEvent?: boolean;
  onEventAdd?: (date: Date) => void;
  onCustomAction?: () => void;
  customActionLabel?: string;
  onCellClick?: (date: Date) => void;
}

// ─── Constantes thème orange ──────────────────────────────────
const STATUS_COLORS: Record<PlanningStatus, string> = {
  PLANIFIÉ: "#f97316", // orange-500
  EN_COURS: "#ea580c", // orange-600
  EN_RETARD: "#dc2626", // red-600
  RÉALISÉ: "#16a34a", // green-600
};

const STATUS_LABELS: Record<PlanningStatus, string> = {
  PLANIFIÉ: "Planifié",
  EN_COURS: "En cours",
  EN_RETARD: "En retard",
  RÉALISÉ: "Réalisé",
};

// ─── Helpers locaux ───────────────────────────────────────────
const getSiteName = (site?: { nom: string }) => site?.nom?? "-";

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

const formatTime = (iso: string) => {
  return iso.split("T")[1]?.slice(0, 5)?? "-";
};

// ─── Composant ────────────────────────────────────────────────
export default function MainCard({
  plannings,
  isLoading = false,
  selectedEvent,
  isPanelOpen,
  onEventClick,
  onPanelClose,
  onEditClick,
  onEventDrop,
  onDeleteClick,
  canAddEvent,
  onEventAdd,
  onCustomAction,
  customActionLabel,
  onCellClick,
}: MainCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [dayListOpen, setDayListOpen] = useState(false);
  const [dayListPlannings, setDayListPlannings] = useState<Planning[]>([]);
  const [dayListDate, setDayListDate] = useState<Date | null>(null);

  const handleShowMore = (plannings: Planning[], date: Date) => {
    setDayListPlannings(plannings);
    setDayListDate(date);
    setDayListOpen(true);
  };

  const handleDayListClick = (planning: Planning) => {
    setDayListOpen(false);
    onEventClick(planning);
  };

  const filteredPlannings = plannings.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.codification?.toLowerCase()?? "").includes(q) ||
      (p.responsable_name?.toLowerCase()?? "").includes(q) ||
      (p.site?.nom?.toLowerCase()?? "").includes(q) ||
      (p.provider?.company_name?.toLowerCase()??
        p.provider?.user?.first_name?.toLowerCase()?? "").includes(q)
    );
  });

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            onSearch={(q) => setSearchQuery(q)}
            placeholder="Rechercher un planning, responsable, site..."
          />
        </div>
        <div className="flex items-center bg-orange-100/80 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === "grid"? "bg-white text-orange-900 shadow-sm" : "text-orange-600 hover:text-orange-800"
              }`}
          >
            <LayoutGrid size={16} /> Grille
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === "list"? "bg-white text-orange-900 shadow-sm" : "text-orange-600 hover:text-orange-800"
              }`}
          >
            <List size={16} /> Liste
          </button>
        </div>
      </div>

      {/* 2. Main Layout */}
      {viewMode === "grid"? (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-orange-50 p-4 rounded-[24px] border border-orange-100 shadow-sm">
              <MiniCalendar
                activeMonth={activeMonth}
                onMonthChange={setActiveMonth}
                plannings={filteredPlannings}
              />
            </div>

            <div className="bg-orange-50 p-6 rounded-[24px] border border-orange-100 shadow-sm space-y-8">
              <EventLegend
                search={searchQuery}
                plannings={filteredPlannings}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 bg-orange-50 rounded-[24px] border border-orange-100 shadow-sm overflow-hidden">
            {isLoading? (
              <div className="p-8 space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-orange-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <CalendarGrid
                search={searchQuery}
                plannings={filteredPlannings}
                activeMonth={activeMonth}
                canAddEvent={canAddEvent}
                onEventAdd={onEventAdd}
                onEventClick={onEventClick}
                onEventDrop={onEventDrop}
                onShowMore={handleShowMore}
                onCellClick={onCellClick}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 rounded-[24px] border border-orange-100 shadow-sm overflow-hidden p-6 mt-4">
          <DataTable
            title="Liste des événements planifiés"
            columns={[
              { header: "Codification", key: "codification", render: (_: any, row: Planning) => <span className="font-bold text-orange-900">{row.codification}</span> },
              { header: "Site", key: "site", render: (_: any, row: Planning) => getSiteName(row.site) },
              { header: "Date de début", key: "date_debut", render: (_: any, row: Planning) => `${formatDate(row.date_debut)} à ${formatTime(row.date_debut)}` },
              {
                header: "Statut", key: "status", render: (_: any, row: Planning) => (
                  <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${STATUS_COLORS[row.status]}15`, color: STATUS_COLORS[row.status] }}>
                    {STATUS_LABELS[row.status]}
                  </span>
                )
              },
              {
                header: "Actions", key: "actions", render: (_: any, row: Planning) => (
                  <button
                    onClick={() => onEventClick(row)}
                    className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-bold transition"
                  >
                    Détails
                  </button>
                )
              }
            ]}
            data={filteredPlannings}
          />
        </div>
      )}

      {/* Panel liste du jour */}
      {dayListOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9998]" onClick={() => setDayListOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-orange-50 z-[9999] shadow-2xl flex flex-col rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-orange-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-orange-900">
                  {dayListDate? dayListDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "Plannings du jour"}
                </h2>
                <p className="text-xs text-orange-500 mt-0.5">{dayListPlannings.length} planning{dayListPlannings.length > 1? "s" : ""}</p>
              </div>
              <button onClick={() => setDayListOpen(false)} className="p-2 hover:bg-orange-100 rounded-xl transition">
                <X size={18} className="text-orange-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {dayListPlannings.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleDayListClick(p)}
                  className="w-full flex items-center gap-4 px-6 py-4 border-b border-orange-50 last:border-0 hover:bg-orange-100 transition text-left group"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[p.status]?? "#f97316" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-orange-900 truncate">{p.codification}</p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      {getSiteName(p.site)} · {formatTime(p.date_debut)}
                    </p>
                    <p className="text-xs text-orange-600">Directeur evenement</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                    style={{ backgroundColor: `${STATUS_COLORS[p.status]}18`, color: STATUS_COLORS[p.status] }}
                  >
                    {STATUS_LABELS[p.status]?? p.status}
                  </span>
                  <ChevronRight size={14} className="text-orange-300 group-hover:text-orange-600 transition shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <SideDetailsPanel
        isOpen={isPanelOpen}
        onClose={onPanelClose}
        title={selectedEvent?.title || ""}
        reference={selectedEvent?.reference}
        fields={selectedEvent?.fields || []}
        descriptionContent={selectedEvent?.description}
        onEdit={onEditClick}
        customAction={onCustomAction}
        customActionLabel={customActionLabel}
      />
    </div>
  );
}
