"use client";

// ============================================================
// components/MiniCalendar.tsx
// Version 100% mockée, thème RGE, zéro dépendance API
// Affiche des points colorés sur les jours avec des plannings
// ============================================================

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";

// Types locaux pour découpler du service API
type PlanningStatus = "PLANIFIÉ" | "EN_COURS" | "EN_RETARD" | "RÉALISÉ";

interface Planning {
  id: number;
  date_debut: string;
  date_fin: string;
  status: PlanningStatus;
}

const STATUS_COLORS: Record<PlanningStatus, string> = {
  PLANIFIÉ: "#163A2C", // vert forêt
  EN_COURS: "#F0A93E", // jaune soleil
  EN_RETARD: "#dc2626", // red-600 pour garder l’alerte visuelle
  RÉALISÉ: "#1E9D55", // vert succès RGE
};

const isPlanningOnDate = (planning: Planning, date: Date): boolean => {
  const start = new Date(planning.date_debut);
  const end = new Date(planning.date_fin);
  const d = new Date(date);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  d.setHours(12, 0, 0, 0);
  return d >= start && d <= end;
};

interface MiniCalendarProps {
  activeMonth: Date;
  onMonthChange: (date: Date) => void;
  plannings: Planning[];
}

export default function MiniCalendar({ activeMonth, onMonthChange, plannings }: MiniCalendarProps) {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; currentMonth: boolean }[] = [];
  for (let i = startingDay; i > 0; i--)
    calendarDays.push({ day: daysInPrevMonth - i + 1, currentMonth: false });
  for (let i = 1; i <= daysInMonth; i++)
    calendarDays.push({ day: i, currentMonth: true });
  const remaining = calendarDays.length <= 35? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++)
    calendarDays.push({ day: i, currentMonth: false });

  useEffect(() => {
    const close = () => { setIsMonthOpen(false); setIsYearOpen(false); };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  function getPlanningsForDay(day: number): Planning[] {
    const date = new Date(year, month, day);
    return plannings.filter(p => isPlanningOnDate(p, date));
  }

  const goToPrev = () => onMonthChange(new Date(year, month - 1, 1));
  const goToNext = () => onMonthChange(new Date(year, month + 1, 1));

  return (
    <div className="bg-[#FBF6EA] p-4 w-full rounded- shadow-sm border border-[#163A2C]/10 relative">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">

          {/* Month picker */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
              className="flex items-center gap-2 bg-[#F0A93E]/15 hover:bg-[#F0A93E]/25 border border-[#F0A93E]/20 px-3 py-1.5 rounded-xl transition-all font-bold text- text-[#163A2C]"
            >
              {months[month]}
              <ChevronDown size={14} className={`transition-transform ${isMonthOpen? "rotate-180" : ""}`} />
            </button>
            {isMonthOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-[#163A2C]/10 shadow-xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="max-h- overflow-y-auto p-1 custom-scrollbar">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => { onMonthChange(new Date(year, i, 1)); setIsMonthOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text- hover:bg-[#FBF6EA] rounded-lg transition-colors"
                    >
                      <span className={month === i? "font-bold text-[#163A2C]" : "text-[#163A2C]/70"}>{m}</span>
                      {month === i && <Check size={14} className="text-[#F0A93E]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Year picker */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
              className="flex items-center gap-2 bg-[#F0A93E]/15 hover:bg-[#F0A93E]/25 border border-[#F0A93E]/20 px-3 py-1.5 rounded-xl transition-all font-bold text- text-[#163A2C]"
            >
              {year}
              <ChevronDown size={14} className={`transition-transform ${isYearOpen? "rotate-180" : ""}`} />
            </button>
            {isYearOpen && (
              <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-[#163A2C]/10 shadow-xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="max-h- overflow-y-auto p-1 custom-scrollbar">
                  {Array.from({ length: 10 }, (_, i) => 2022 + i).map((y) => (
                    <button
                      key={y}
                      onClick={() => { onMonthChange(new Date(y, month, 1)); setIsYearOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text- hover:bg-[#FBF6EA] rounded-lg transition-colors"
                    >
                      <span className={year === y? "font-bold text-[#163A2C]" : "text-[#163A2C]/70"}>{y}</span>
                      {year === y && <Check size={14} className="text-[#F0A93E]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Arrows */}
        <div className="flex gap-1">
          <button onClick={goToPrev} className="p-2 hover:bg-[#163A2C]/5 rounded-lg text-[#163A2C]/60 hover:text-[#163A2C] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={goToNext} className="p-2 hover:bg-[#163A2C]/5 rounded-lg text-[#163A2C]/60 hover:text-[#163A2C] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 w-full text-center">
        {days.map((d) => (
          <div key={d} className="text- font-bold text-[#163A2C]/40 mb-4 tracking-widest">{d}</div>
        ))}
        {calendarDays.map((dateObj, i) => {
          const todayHighlight = dateObj.currentMonth && isToday(dateObj.day, month, year);
          const dayPlannings = dateObj.currentMonth? getPlanningsForDay(dateObj.day) : [];

          return (
            <div key={i} className="aspect-square flex flex-col items-center justify-center p-0.5 gap-0.5">
              <button
                onClick={() => {
                  if (dateObj.currentMonth) {
                    onMonthChange(new Date(year, month, dateObj.day));
                  }
                }}
                className={`w-full h-full max-w- max-h- text- flex items-center justify-center rounded-xl transition-all
                  ${!dateObj.currentMonth? "text-[#163A2C]/20 cursor-default" : "text-[#163A2C] font-semibold hover:bg-[#163A2C]/5 hover:text-[#163A2C]"}
                  ${todayHighlight? "bg-[#163A2C] text-white shadow-lg hover:bg-[#0E241C]" : ""}
                `}
              >
                {dateObj.day}
              </button>

              {dayPlannings.length > 0 && (
                <div className="flex gap-0.5 justify-center">
                  {dayPlannings.slice(0, 3).map((p, idx) => (
                    <div
                      key={idx}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[p.status]?? "#F0A93E" }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #F0A93E; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function isToday(day: number, m: number, y: number) {
  const d = new Date();
  return day === d.getDate() && m === d.getMonth() && y === d.getFullYear();
}