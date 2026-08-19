"use client";

import Link from "next/link";
import { Folder, Users, ChevronRight, ListChecks } from "lucide-react";

export interface DashboardProjectRow {
  id: number;
  title: string;
  tasks_count: number;
}

export interface DashboardPersonnelStat {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  completed_tasks_count: number;
  in_progress_tasks_count: number;
  total_tasks_count: number;
}

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="h-3.5 w-2/3 bg-gray-200 rounded-full" />
      <div className="h-5 w-12 bg-gray-100 rounded-full" />
    </div>
  );
}

type Props = {
  projects?: DashboardProjectRow[];
  personnel?: DashboardPersonnelStat[];
  loading?: boolean;
  viewAllProjectsHref?: string;
  viewAllPersonnelHref?: string;
  /** Href de chaque carte projet — si omis les cartes ne sont pas cliquables */
  projectHref?: string | ((project: DashboardProjectRow) => string);
};

export default function EventListCard({
  projects = [],
  personnel = [],
  loading = false,
  viewAllProjectsHref = "/user/projets",
  // viewAllPersonnelHref = "/user/equipe",
  projectHref,
}: Props) {
  const isProjectsEmpty  = !loading && projects.length === 0;
  const isPersonnelEmpty = !loading && personnel.length === 0;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

        {/* ── Projets ── */}
        <div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Folder size={13} className="text-blue-700" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">Mes projets</h2>
                {!loading && !isProjectsEmpty && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {projects.length} projet{projects.length > 1 ? "s" : ""} en cours
                  </p>
                )}
              </div>
            </div>
            <Link
              href={viewAllProjectsHref}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors group px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              voir plus
              <ChevronRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="p-5 space-y-3">
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

            {isProjectsEmpty && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Folder size={22} strokeWidth={1.5} className="opacity-50" />
                </div>
                <p className="text-sm font-medium text-gray-500">Aucun projet</p>
                <p className="text-xs text-gray-400 mt-1">Vos projets assignés apparaîtront ici</p>
              </div>
            )}

            {!loading && projects.map((project) => {
              const href = typeof projectHref === "function" ? projectHref(project) : projectHref;
              const content = (
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4 transition-all duration-200 ${
                    href ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 pr-2">
                    {project.title}
                  </p>
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                    <ListChecks size={11} />
                    {project.tasks_count} tâche{project.tasks_count > 1 ? "s" : ""}
                  </span>
                </div>
              );
              return href ? (
                <Link key={project.id} href={href} className="block">{content}</Link>
              ) : (
                <div key={project.id}>{content}</div>
              );
            })}
          </div>
        </div>

        {/* ── Équipe ── */}
        <div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users size={13} className="text-purple-700" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">Équipe</h2>
                {!loading && !isPersonnelEmpty && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {personnel.length} membre{personnel.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <button
              
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors group px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              voir plus
              <ChevronRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="p-5 space-y-3">
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

            {isPersonnelEmpty && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Users size={22} strokeWidth={1.5} className="opacity-50" />
                </div>
                <p className="text-sm font-medium text-gray-500">Aucune donnée</p>
                <p className="text-xs text-gray-400 mt-1">Les statistiques de l&apos;équipe apparaîtront ici</p>
              </div>
            )}

            {!loading && personnel.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(
                      p.id
                    )}`}
                  >
                    {initials(p.first_name, p.last_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{p.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-11">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-orange-50 text-orange-600 border-orange-200">
                    {p.in_progress_tasks_count} en cours
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200">
                    {p.completed_tasks_count} terminée{p.completed_tasks_count > 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-gray-50 text-gray-600 border-gray-200">
                    {p.total_tasks_count} au total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}