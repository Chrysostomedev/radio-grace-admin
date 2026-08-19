"use client";
import { Globe, Calendar, Users, Award, Tag } from "lucide-react";

interface Props {
    event_name:    string;
    location:      string;
    country?:      string;
    date_start:    string;
    date_end:      string;
    status:        string;       // "confirmed" | "pending" | "cancelled" | dérivé des dates
    intervenants_count: number;
    event_type?:   string;
}

function deriveStatus(start: string, end: string, passedStatus?: string): string {
    if (passedStatus && ["confirmed","pending","cancelled"].includes(passedStatus)) return passedStatus;
    const now = new Date();
    if (new Date(start) > now) return "pending";
    if (new Date(end) < now)   return "cancelled";
    return "confirmed";
}

export default function RepresentationEventHub({
    event_name, location, country, date_start, date_end, status, intervenants_count, event_type,
}: Props) {
    const duration = Math.max(1,
        Math.floor((new Date(date_end).getTime() - new Date(date_start).getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const resolvedStatus = deriveStatus(date_start, date_end, status);
    const progress = resolvedStatus === "confirmed" ? 100 : resolvedStatus === "pending" ? 50 : 0;

    const statusLabel = {
        confirmed: "Confirmé",
        pending:   "À venir",
        cancelled: "Terminé",
    }[resolvedStatus] ?? resolvedStatus;

    return (
        <div className="bg-white rounded-xl p-6 text-black overflow-hidden relative border border-slate-100 shadow-sm">
            {/* Pattern décoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-black/70">Événement</h3>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/10 rounded-full backdrop-blur">
                        <Award size={14} className="text-orange-400" />
                        <span className="text-xs font-black">{statusLabel}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Radial durée */}
                    <div className="col-span-3 lg:col-span-1 flex flex-col items-center justify-center">
                        <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/10" />
                                <circle
                                    cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                                    className="text-orange-500 transition-all duration-1000"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black">{duration}j</span>
                                <span className="text-xs text-black/60 font-bold uppercase">Durée</span>
                            </div>
                        </div>
                    </div>

                    {/* Métriques */}
                    <div className="col-span-3 lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-black/5 backdrop-blur rounded-2xl p-4 border border-black/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <Globe size={16} className="text-orange-400" />
                                </div>
                                <span className="text-xs text-black/60 font-bold uppercase">Lieu</span>
                            </div>
                            <p className="text-lg font-black line-clamp-1">{country || location.split(",").pop()?.trim() || "—"}</p>
                            <p className="text-xs text-black/50 mt-1 line-clamp-1">{location}</p>
                        </div>

                        <div className="bg-black/5 backdrop-blur rounded-2xl p-4 border border-black/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <Calendar size={16} className="text-orange-400" />
                                </div>
                                <span className="text-xs text-black/60 font-bold uppercase">Dates</span>
                            </div>
                            <p className="text-lg font-black">
                                {new Date(date_start).getDate()}{" "}
                                {new Date(date_start).toLocaleDateString("fr-FR", { month: "short" })}
                            </p>
                            {event_type && (
                                <p className="text-xs text-black/50 mt-1 flex items-center gap-1">
                                    <Tag size={10} /> {event_type}
                                </p>
                            )}
                        </div>

                        <div className="bg-black/5 backdrop-blur rounded-2xl p-4 border border-black/10 col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <Users size={16} className="text-orange-400" />
                                    </div>
                                    <span className="text-xs text-black/60 font-bold uppercase">Intervenants</span>
                                </div>
                                <span className="text-xl font-black">{intervenants_count}</span>
                            </div>
                            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, intervenants_count * 20)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}