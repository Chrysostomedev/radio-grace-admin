"use client";

import { ArrowRight, Clock } from "lucide-react";
import { formatDatetime } from "@/lib/format.data";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatusSnap {
    id:    number;
    name:  string;
    code:  string;
    color: string;
}

interface ChangedBy {
    id:         number;
    first_name: string;
    last_name:  string;
}

export interface TaskHistory {
    id:          number;
    from_status: StatusSnap | null;
    to_status:   StatusSnap;
    changed_by:  ChangedBy;
    changed_at:  string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexAlpha(hex: string, alpha = "22") {
    return `${hex}${alpha}`;
}

function initials(u: ChangedBy) {
    return `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function TaskHistoryTimeline({ histories }: { histories: TaskHistory[] }) {
    if (!histories || histories.length === 0) return null;

    // Du plus récent au plus ancien
    const sorted = [...histories].sort(
        (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
                <Clock size={15} className="text-orange-400" />
                <h3 className="font-black text-slate-900 text-[14px]">
                    Historique des statuts
                    <span className="ml-1.5 text-slate-400 font-semibold text-[13px]">
                        ({sorted.length})
                    </span>
                </h3>
            </div>

            <div className="space-y-2">
                {sorted.map((h, i) => (
                    <div
                        key={h.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                            i === 0 ? "bg-orange-50 border border-orange-100" : "bg-slate-50/60"
                        }`}
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-orange-400 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {initials(h.changed_by)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* De */}
                                {h.from_status ? (
                                    <span
                                        className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black"
                                        style={{
                                            backgroundColor: hexAlpha(h.from_status.color),
                                            color:           h.from_status.color,
                                        }}
                                    >
                                        {h.from_status.name}
                                    </span>
                                ) : (
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500">
                                        Création
                                    </span>
                                )}

                                <ArrowRight size={12} className="text-slate-300 shrink-0" />

                                {/* Vers */}
                                <span
                                    className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black"
                                    style={{
                                        backgroundColor: hexAlpha(h.to_status.color),
                                        color:           h.to_status.color,
                                    }}
                                >
                                    {h.to_status.name}
                                </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-0.5">
                                par{" "}
                                <span className="font-bold text-slate-600">
                                    {h.changed_by.first_name} {h.changed_by.last_name}
                                </span>
                                {" · "}
                                {formatDatetime(h.changed_at)}
                            </p>
                        </div>

                        {/* Badge "récent" */}
                        {i === 0 && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500 text-white shrink-0">
                                Dernier
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
