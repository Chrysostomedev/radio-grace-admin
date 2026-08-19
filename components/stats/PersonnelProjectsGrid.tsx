"use client";

import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Target } from "lucide-react";
import { formatDateFR } from "@/lib/format.data";

interface Project {
    id: number;
    title: string;
    status: { name: string; color: string };
    role: string;
    progress: number;
    total_tasks: number;
    completed_tasks: number;
    my_tasks: number;
    my_completed: number;
    due_date: string;
}

export default function PersonnelProjectsGrid({ projects }: { projects: Project[] }) {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map(p => (
                <button
                    key={p.id}
                    onClick={() => router.push(`/admin/projets/${p.id}`)}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-orange-200 hover:shadow-md transition group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-black text-slate-900 truncate group-hover:text-[#f97316] transition">
                                {p.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black"
                                    style={{ backgroundColor: `${p.status.color}1A`, color: p.status.color }}
                                >
                                    {p.status.name}
                                </span>
                                <span className="text-[11px] font-bold text-orange-500">{p.role}</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-[#f97316] transition shrink-0" />
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                                <span className="font-bold text-slate-500">Avancement global</span>
                                <span className="font-black text-slate-700">{p.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{p.completed_tasks}/{p.total_tasks} tâches</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-[12px]">
                                <Target size={14} className="text-emerald-500" />
                                <span className="font-bold text-slate-700">{p.my_completed}/{p.my_tasks}</span>
                                <span className="text-slate-400">mes tâches</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Calendar size={13} />
                                {formatDateFR(p.due_date)}
                            </div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
