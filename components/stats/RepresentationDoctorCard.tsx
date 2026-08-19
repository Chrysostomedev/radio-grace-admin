"use client";
import { Edit2, Trash2, User, Award } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  role: string;
  expertise?: string;
}

interface Props {
  doctor: Doctor;
  onEdit: (d: Doctor) => void;
  onDelete: (id: number) => void;
}

const ROLE_CONFIG: Record<string, { label: string; accent: string }> = {
  panelist: { label: "Panéliste", accent: "from-orange-500 to-orange-600" },
  keynote: { label: "Conférencier", accent: "from-orange-600 to-orange-700" },
  participant: { label: "Participant", accent: "from-slate-500 to-slate-600" },
  moderator: { label: "Modérateur", accent: "from-orange-500 to-orange-600" },
  observer: { label: "Observateur", accent: "from-slate-400 to-slate-500" },
};

export default function RepresentationDoctorCard({ doctor, onEdit, onDelete }: Props) {
  const config = ROLE_CONFIG[doctor.role]?? ROLE_CONFIG.participant;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.accent} flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20`}>
              <User size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text- leading-tight line-clamp-1 group-hover:text-[#f97316] transition">
                {doctor.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Award size={12} className="text-orange-500" />
                <span className="text- text-slate-500 font-bold">{config.label}</span>
              </div>
            </div>
          </div>

          {/* Actions hover */}
          {/* <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <button
              onClick={() => onEdit(doctor)}
              className="p-2 text-slate-400 hover:text-[#f97316] hover:bg-orange-50 rounded-lg transition"
              title="Éditer"
            >
              <Edit2 size={15} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onDelete(doctor.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Retirer"
            >
              <Trash2 size={15} strokeWidth={2.5} />
            </button>
          </div> */}
        </div>

        {/* Expertise */}
        {doctor.expertise && (
          <div className="p-3 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-xl border border-slate-100">
            <p className="text- text-slate-500 font-black uppercase tracking-wider mb-1">Expertise</p>
            <p className="text- text-slate-700 font-medium">{doctor.expertise}</p>
          </div>
        )}
      </div>
    </div>
  );
}