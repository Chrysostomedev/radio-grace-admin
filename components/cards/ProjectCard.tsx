"use client";

import Link from "next/link";
import { Calendar, Users, ArrowUpRight, Layers } from "lucide-react";
import type { Project } from "@/types/admin";
import { formatDateShort } from "@/lib/format.data";

// ── Config statuts / priorités (mêmes que page.tsx) ───────────────────────────
const STATUS: Record<string, { label: string; bg: string; text: string }> = {
    draft:     { label: "BROUILLON", bg: "bg-slate-100",  text: "text-slate-500"  },
    active:    { label: "EN COURS",  bg: "bg-blue-100",   text: "text-blue-600"   },
    completed: { label: "TERMINÉ",   bg: "bg-green-100",  text: "text-green-600"  },
    cancelled: { label: "ANNULÉ",    bg: "bg-red-100",    text: "text-red-500"    },
};

const PRIORITY: Record<string, { label: string; color: string }> = {
    low:    { label: "Faible",  color: "text-slate-400"  },
    medium: { label: "Moyen",   color: "text-amber-500"  },
    high:   { label: "Élevé",   color: "text-orange-500" },
   
};

function ProgressBar({ value = 0 }: { value?: number }) {
    const pct   = Math.min(100, Math.max(0, value));
    const color = pct >= 60 ? "bg-emerald-500" : pct >= 30 ? "bg-[#f97316]" : "bg-slate-300";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] font-bold text-slate-400 w-7 shrink-0">{pct}%</span>
        </div>
    );
}

interface ProjectCardProps {
    project?: Project | null;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    if (!project) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-center text-slate-400 italic text-sm">
                Indisponible
            </div>
        );
    }

    const st = STATUS[project.status]     ?? STATUS.draft;
    const pr = PRIORITY[project.priority]  ?? PRIORITY.medium;

    const detailUrl  = `/admin/projets/${project.id}`;
    const membresUrl = `/admin/projets/membres?project_id=${project.id}`;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2.5 h-full flex flex-col gap-2">

            {/* Bloc titre / type / statut */}
            <div className="bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight truncate pr-2">
                        {project.title || "N/A"}
                    </h3>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${st.bg} ${st.text}`}>
                        {st.label}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {project.project_type ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <Layers size={10} />
                            {project.project_type.name}
                        </span>
                    ) : null}
                    <span className={`text-[11px] font-black ${pr.color}`}>{pr.label}</span>
                </div>
            </div>

            {/* Bloc infos */}
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex-grow space-y-2">
                <p className="text-sm font-bold text-slate-900 truncate">
                    {project.coordinator
                        ? `${project.coordinator.first_name} ${project.coordinator.last_name}`
                        : "Aucun coordinateur"}
                </p>

                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                    <div className="p-1 bg-slate-50 rounded-md shrink-0">
                        <Calendar size={11} className="text-slate-700" />
                    </div>
                    <span className="truncate">
                        {project.start_date ? formatDateShort(project.start_date) : "—"}
                        {" → "}
                        {project.end_date ? formatDateShort(project.end_date) : "—"}
                    </span>
                </div>

                {/* Progression si dispo */}
                {typeof project.progress === "number" && (
                    <ProgressBar value={project.progress} />
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-1.5">
                {/* <Link
                    href={membresUrl}
                    className="bg-[#f97316] text-white rounded-xl px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 transition"
                    title="Membres"
                >
                    <Users size={14} />
                    <span className="text-xs font-black">{project.members_count ?? 0}</span>
                </Link> */}
                <Link
                    href={detailUrl}
                    className="flex-grow bg-[#f97316] text-white rounded-xl px-3 py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors group text-xs"
                >
                    Voir le projet
                    <div className="border border-white/30 rounded-full p-0.5 group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowUpRight size={10} />
                    </div>
                </Link>
            </div>
        </div>
    );
}