"use client";
import { Award } from "lucide-react";

interface Props {
  distribution: { excellent: number; bon: number; moyen: number; ameliorer: number };
}

export default function EvaluationDistribution({ distribution }: Props) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const items = [
    { label: "Excellent", value: distribution.excellent, color: "bg-emerald-500" },
    { label: "Bon", value: distribution.bon, color: "bg-blue-500" },
    { label: "Moyen", value: distribution.moyen, color: "bg-orange-500" },
    { label: "À améliorer", value: distribution.ameliorer, color: "bg-slate-400" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-[#f97316]" strokeWidth={2.5} />
        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Répartition</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = total > 0? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                <span className="text-[11px] font-black text-slate-900">{item.value} <span className="text-slate-400">({pct}%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
