"use client";

import type { PlanningStatus } from "./CalendarGrid";

interface Planning {
  id: number;
  codification: string;
  date_debut: string;
  status: PlanningStatus;
  responsable_name: string;
  site?: { nom: string };
}

const STATUS_COLORS: Record<PlanningStatus, string> = {
  PLANIFIÉ: "#163A2C",
  EN_COURS: "#F0A93E",
  EN_RETARD: "#dc2626",
  RÉALISÉ: "#1E9D55",
};

const STATUS_BG: Record<PlanningStatus, string> = {
  PLANIFIÉ: "#163A2C14",
  EN_COURS: "#F0A93E22",
  EN_RETARD: "#fee2e2",
  RÉALISÉ: "#1E9D551A",
};

const LEGEND_ITEMS = [
  { label: "Planifié", color: STATUS_COLORS["PLANIFIÉ"], bg: STATUS_BG["PLANIFIÉ"] },
  { label: "En cours", color: STATUS_COLORS["EN_COURS"], bg: STATUS_BG["EN_COURS"] },
  { label: "En retard", color: STATUS_COLORS["EN_RETARD"], bg: STATUS_BG["EN_RETARD"] },
  { label: "Réalisé", color: STATUS_COLORS["RÉALISÉ"], bg: STATUS_BG["RÉALISÉ"] },
];

interface EventLegendProps {
  search?: string;
  plannings: Planning[];
}

export default function EventLegend({ search = "", plannings }: EventLegendProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingPlannings = plannings
 .filter((p) => {
      const debut = new Date(p.date_debut);
      debut.setHours(0, 0, 0, 0);
      const isUpcoming = debut >= today;
      const matchSearch =
    !search ||
        p.codification.toLowerCase().includes(search.toLowerCase()) ||
        p.responsable_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.site?.nom?? "").toLowerCase().includes(search.toLowerCase());
      return isUpcoming && matchSearch;
    })
 .slice(0, 5);

  return (
    <div className="space-y-8 bg-[#FBF6EA] p-6 rounded-2xl border border-[#163A2C]/10">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#163A2C]/70 uppercase tracking-widest">Légende</h3>
        <div className="grid grid-cols-2 gap-2">
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.label}
              style={{ backgroundColor: item.bg }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#163A2C]/5"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text- font-bold text-[#163A2C]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#163A2C]/70 uppercase tracking-widest">Événements à venir</h3>

        {upcomingPlannings.length === 0? (
          <p className="text- text-[#163A2C]/40 italic">Aucun événement à venir.</p>
        ) : (
          <div className="space-y-4">
            {upcomingPlannings.map((planning) => {
              const color = STATUS_COLORS[planning.status]?? "#F0A93E";
              const [year, month, day] = planning.date_debut.split("T")[0].split("-");
              const dateLabel = `${day}/${month}`;

              return (
                <div
                  key={planning.id}
                  className="flex items-center justify-between text-"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#163A2C] leading-tight line-clamp-1">
                        {planning.codification}
                      </span>
                      {planning.site?.nom && (
                        <span className="text-[#163A2C]/50 text-">
                          {planning.site.nom}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[#163A2C]/50 font-medium flex-shrink-0 ml-2">{dateLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}