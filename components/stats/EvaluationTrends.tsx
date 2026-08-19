"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Trend {
  label: string;
  value: number;
  delta?: number;
}
interface Props {
  data: Trend[];
}

export default function EvaluationTrends({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Tendances CAPEC</h3>
        <span className="text-[10px] text-slate-400 font-bold">30 derniers jours</span>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => {
  const delta = item.delta ?? 0;
  const isUp = delta > 0;
  const isDown = delta < 0;
          return (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
              <div className="flex-1">
                <p className="text-[12px] font-bold text-slate-700">{item.label}</p>
                <p className="text-[18px] font-black text-slate-900 mt-0.5">{item.value}</p>
              </div>
              {/* <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black ${
                isUp? "bg-emerald-50 text-emerald-700" : isDown? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
              }`}>
                {isUp? <TrendingUp size={13} strokeWidth={3} /> : isDown? <TrendingDown size={13} strokeWidth={3} /> : <Minus size={13} strokeWidth={3} />}
<span>{Math.abs(delta)}%</span>
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
