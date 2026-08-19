"use client";

// ============================================================
// components/CalendarGrid.tsx
// Version mockée + thème RGE. Zéro dépendance API.
// Reçoit les plannings via props depuis MainCard
// ============================================================

import { DayCell } from "../ui/DayCell";

// Types locaux pour découpler du service API
export type PlanningStatus = "PLANIFIÉ" | "EN_COURS" | "EN_RETARD" | "RÉALISÉ";

export interface Planning {
  id: number;
  codification: string;
  date_debut: string;
  date_fin: string;
  status: PlanningStatus;
  responsable_name: string;
  site?: { id: number; nom: string };
  provider?: { id: number; company_name?: string; user?: { first_name: string; last_name: string } };
}

// Constantes thème RGE pour remplacer STATUS_COLORS du service
const STATUS_COLORS: Record<PlanningStatus, string> = {
  PLANIFIÉ: "bg-[#FBF6EA] text-[#163A2C] border border-[#F0A93E]/20",
  EN_COURS: "bg-[#F0A93E] text-[#163A2C]",
  EN_RETARD: "bg-red-500 text-white",
  RÉALISÉ: "bg-[#1E9D55] text-white",
};

// Helper local pour éviter l'import du service
const isPlanningOnDate = (planning: Planning, date: Date): boolean => {
  const start = new Date(planning.date_debut);
  const end = new Date(planning.date_fin);
  const d = new Date(date);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  d.setHours(12, 0, 0, 0);
  return d >= start && d <= end;
};

interface CalendarEvent {
  id: number;
  label: string;
  time: string;
  color: string;
  status: string;
  planning: Planning;
}

interface CalendarGridProps {
  search?: string;
  plannings: Planning[];
  activeMonth: Date;
  onEventClick: (planning: Planning) => void;
  onEventDrop?: (planningId: number, newDate: Date) => void;
  canAddEvent?: boolean;
  onEventAdd?: (date: Date) => void;
  onShowMore?: (plannings: Planning[], date: Date) => void;
  onCellClick?: (date: Date) => void;
}

export default function CalendarGrid({
  search = "",
  plannings,
  activeMonth,
  onEventClick,
  onEventDrop,
  canAddEvent,
  onEventAdd,
  onShowMore,
  onCellClick,
}: CalendarGridProps) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0? 6 : firstDayOfMonth - 1;
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; events: CalendarEvent[] }[] = [];

  for (let i = startingDay; i > 0; i--) {
    cells.push({ day: daysInPrevMonth - i + 1, currentMonth: false, events: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayPlannings = plannings.filter((p) => isPlanningOnDate(p, date));

    const filtered = dayPlannings.filter((p) => {
      const q = search.toLowerCase();
      return (
     !q ||
        p.codification.toLowerCase().includes(q) ||
        p.responsable_name.toLowerCase().includes(q) ||
        (p.site?.nom?? "").toLowerCase().includes(q) ||
        (p.provider?.company_name?? p.provider?.user?.first_name?? "").toLowerCase().includes(q)
      );
    });

    const events: CalendarEvent[] = filtered.map((p) => ({
      id: p.id,
      label: p.codification,
      time: p.date_debut.split("T")[1]?.slice(0, 5)?? "-",
      color: STATUS_COLORS[p.status]?? "#F0A93E",
      status: p.status,
      planning: p,
    }));

    cells.push({ day: d, currentMonth: true, events });
  }

  // Toujours forcer 42 cases (6 lignes) → hauteur de grille
// strictement identique quel que soit le mois affiché.
const remaining = 42 - cells.length;
for (let i = 1; i <= remaining; i++) {
  cells.push({ day: i, currentMonth: false, events: [] });
}
  const DAY_HEADERS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

  return (
    <div className="w-full">
      {/* Headers - thème RGE */}
      <div className="grid grid-cols-7 border-b border-[#163A2C]/10">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text- font-black text-[#163A2C]/60 tracking-widest text-center py-3"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 border-l border-[#163A2C]/10">
        {cells.map((cell, i) => {
          const cellDate = cell.currentMonth
         ? new Date(year, month, cell.day)
            : cell.day > 20
         ? new Date(year, month - 1, cell.day)
            : new Date(year, month + 1, cell.day);

          return (
            <DayCell
              key={i}
              day={cell.day}
              currentMonth={cell.currentMonth}
              date={cellDate}
              events={cell.events}
              canAddEvent={canAddEvent}
              onAddClick={onEventAdd}
              onClick={(event) => {
                if (event?.planning) onEventClick(event.planning);
              }}
              onShowMore={
                onShowMore
               ? (evts, date) => {
                      onShowMore(
                        evts.map((e) => e.planning),
                        date
                      );
                    }
                  : undefined
              }
              onDrop={(planningId) => {
                if (cell.currentMonth && onEventDrop) {
                  onEventDrop(planningId, cellDate);
                }
              }}
              onCellClick={onCellClick}
            />
          );
        })}
      </div>
    </div>
  );
}