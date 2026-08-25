"use client";

import { Calendar, ChevronRight, Target } from "lucide-react";

// ── Types locaux ──────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  code?: string;
  status?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
}

interface PersonnelProjectsGridProps {
  projects?: Project[];
  onProjectClick?: (id: number) => void;
}

// ── Formateur de date local (statique) ────────────────────────────────────────

function formatDateFR(dateString?: string): string {
  if (!dateString) return "Non définie";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Non définie";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Données factices (statiques) ──────────────────────────────────────────────

const STATIC_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Refonte du site Radio Grace",
    code: "RGA-2026",
    status: "En cours",
    color: "#f97316",
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    progress: 65,
  },
  {
    id: 2,
    name: "Système de notification en temps réel",
    code: "NOTIF-02",
    status: "En révision",
    color: "#6366f1",
    startDate: "2026-02-01",
    endDate: "2026-04-15",
    progress: 85,
  },
  {
    id: 3,
    name: "Migration de la base de données",
    code: "DB-MIG",
    status: "Terminé",
    color: "#10b981",
    startDate: "2025-11-01",
    endDate: "2026-01-10",
    progress: 100,
  },
];

// ── Composant Principal ───────────────────────────────────────────────────────

export default function PersonnelProjectsGrid({
  projects = STATIC_PROJECTS,
  onProjectClick,
}: PersonnelProjectsGridProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
        <Target size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-bold text-slate-600">Aucun projet assigné</p>
        <p className="text-xs text-slate-400 mt-1">
          Aucun projet ne semble être attribué à ce membre pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onProjectClick?.(project.id)}
          className="group bg-white rounded-3xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            {/* Header / Badges */}
            <div className="flex items-center justify-between gap-2 mb-3">
              {project.code && (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  {project.code}
                </span>
              )}
              {project.status && (
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: project.color ? `${project.color}15` : "#f9731615",
                    color: project.color || "#f97316",
                  }}
                >
                  {project.status}
                </span>
              )}
            </div>

            {/* Titre */}
            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-2">
              {project.name}
            </h3>

            {/* Dates */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-medium">
              <Calendar size={13} className="text-slate-300" />
              <span>
                {formatDateFR(project.startDate)} - {formatDateFR(project.endDate)}
              </span>
            </div>
          </div>

          {/* Progression */}
          <div className="mt-5 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-400">Progression</span>
              <span className="text-slate-700">{project.progress ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${project.progress ?? 0}%`,
                  backgroundColor: project.color || "#f97316",
                }}
              />
            </div>

            <div className="flex items-center justify-end text-xs font-bold text-orange-500 mt-3 group-hover:translate-x-1 transition-transform">
              Voir le projet <ChevronRight size={14} className="ml-0.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}