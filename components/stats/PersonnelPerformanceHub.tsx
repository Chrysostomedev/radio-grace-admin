"use client";
import { Target, Zap, Clock, Trophy, CheckCircle2 } from "lucide-react";

interface Props {
  totalProjects: number;
  totalMyTasks: number;
  totalMyCompleted: number;
  avgProgress: number;
  recentActivity?: { date: string; label: string }[];
}

export default function PersonnelPerformanceHub({
  totalProjects,
  totalMyTasks,
  totalMyCompleted,
  avgProgress,
  recentActivity = []
}: Props) {
  const completionRate = totalMyTasks > 0? Math.round((totalMyCompleted / totalMyTasks) * 100) : 0;
  const tasksRemaining = totalMyTasks - totalMyCompleted;

  return (
    <div className="bg-white rounded-3xl p-6 text-orange-800 overflow-hidden relative leading-tight">
      {/* Pattern décoratif */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48  rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-black/70">Performance globale</h3>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/10 rounded-full backdrop-blur">
            <Trophy size={14} className="text-orange-800" />
            <span className="text-[11px] font-black">
              {avgProgress >= 80? "Expert" : avgProgress >= 60? "Avancé" : "En progression"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Radial principal */}
          <div className="col-span-3 lg:col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/10" />
                <circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - avgProgress / 100)}`}
                  className="text-orange-500 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{avgProgress}%</span>
                <span className="text-[10px] text-black/60 font-bold uppercase">Moyenne</span>
              </div>
            </div>
          </div>

          {/* Métriques */}
          <div className="col-span-3 lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-black/5 backdrop-blur rounded-2xl p-4 border border-black/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Target size={16} className="text-blue-400" />
                </div>
                <span className="text-[10px] text-black/60 font-bold uppercase">Projets</span>
              </div>
              <p className="text-2xl font-black">{totalProjects}</p>
              <p className="text-[11px] text-black/50 mt-1">actifs</p>
            </div>

            <div className="bg-black/5 backdrop-blur rounded-2xl p-4 border border-black/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap size={16} className="text-orange-400" />
                </div>
                <span className="text-[10px] text-black/60 font-bold uppercase">Tâches</span>
              </div>
              <p className="text-2xl font-black">{totalMyTasks}</p>
              <p className="text-[11px] text-black/50 mt-1">{tasksRemaining} restantes</p>
            </div>

            <div className="bg-black/5 backdrop-blur rounded-2xl p-4 border border-black/10 col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-black/60 font-bold uppercase">Taux complétion</span>
                </div>
                <span className="text-xl font-black">{completionRate}%</span>
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-[11px] text-black/50 mt-2">{totalMyCompleted} sur {totalMyTasks} terminées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
