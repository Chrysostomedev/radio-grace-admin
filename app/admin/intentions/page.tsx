"use client";
import { useState } from "react";
import { useIntentions } from "@/hooks/admin/useIntentions";
import StatsCard from "@/components/cards/StatsCard";
import { Heart, Check, Clock, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IntentionsPage() {
  const router = useRouter();
  const { intentions, loading, statut, setStatut, markAsPrie } = useIntentions();
  const [selected, setSelected] = useState<any>(null);

  const stats = {
    total: intentions.length,
    attente: intentions.filter(i => i.statut === "EN_ATTENTE" || i.statut === "PLANIFIE").length,
    prie: intentions.filter(i => i.statut === "PRIE").length,
  };

  const STATUTS = [
    { id: "all", label: "Toutes" },
    { id: "EN_ATTENTE", label: "En attente" },
    { id: "PRIE", label: "Priées" },
    { id: "CLOTURE", label: "Clôturées" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total intentions" value={stats.total} delta={`${stats.attente} en attente`} />
        <StatsCard label="En attente" value={stats.attente} trend="up" />
        <StatsCard label="Priées 🙏" value={stats.prie} />
      </div>

      <div className="flex items-center gap-2">
        {STATUTS.map(s => (
          <button key={s.id} onClick={() => setStatut(s.id)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${statut===s.id? "bg-[#163A2C] text-white border-[#163A2C]" : "bg-white text-[#163A2C] border-[#163A2C]/10"}`}>{s.label}</button>
        ))}
      </div>

      {loading? <div className="py-16 text-center bg-white rounded-2xl">Chargement...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intentions.map((it:any) => (
            <div key={it.id} className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-3">
                <span className={`text- font-black px-2.5 py-1 rounded-full uppercase ${it.statut==="PRIE"? "bg-[#1E9D55]/10 text-[#1E9D55]" : it.statut==="EN_ATTENTE"? "bg-[#F0A93E]/20 text-[#9A6A1E]" : "bg-[#163A2C]/10 text-[#163A2C]"}`}>{it.statut}</span>
                <span className="text- text-[#163A2C]/40">{it.created_human}</span>
              </div>
              <h3 className="font-black text-[#163A2C] text- leading-tight line-clamp-2">{it.intention}</h3>
              <p className="text- text-[#163A2C]/60 mt-2 line-clamp-3">{it.description || "Aucune description"}</p>
              <div className="mt-4 pt-4 border-t border-[#163A2C]/5 flex items-center justify-between">
                <div>
                  <p className="text- font-bold text-[#163A2C]">{it.nom}</p>
                  <p className="text- text-[#163A2C]/40">{it.is_anonyme? "Anonyme" : it.telephone || "—"} {it.is_public? "• Public" : "• Privé"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>router.push(`/admin/intentions/${it.id}`)} className="p-2 bg-[#163A2C]/5 rounded-xl hover:bg-[#163A2C]/10"><Eye size={14}/></button>
                  {it.statut!== "PRIE" && (
                    <button onClick={()=>markAsPrie(it.id, "PRIE")} className="p-2 bg-[#1E9D55] text-white rounded-xl hover:bg-[#1E9D55]/90" title="Marquer priée"><Check size={14}/></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {intentions.length===0 &&!loading && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed">Aucune intention {statut!=="all"? `en ${statut}` : ""}</div>
      )}
    </div>
  );
}