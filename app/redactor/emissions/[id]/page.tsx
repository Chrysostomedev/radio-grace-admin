"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, Users, RadioTower, Headphones, Timer, TrendingUp, Activity, Calendar, Mic2 } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";
import DonutCard from "@/components/cards/DonutCard";
import ListCard from "@/components/cards/ListCard";
import { ROUTES } from "@/lib/routes";

// ── MOCK DETAIL RGE ─────────────────────────────────────────────────────────
const MOCK_EMISSIONS_DETAIL: Record<string, any> = {
  "1": {
    id: 1, title: "Acclamez le Seigneur", category: "acclamez", jour: "samedi", horaire: "16:00 - 17:30", animateur: "Père Attobra", image: "/img/emissions/acclamez.jpg",
    description: "Grande louange en direct depuis la paroisse de Daoa. L'Évangile au cœur de l'Homme.",
    stats: { auditeurs_total: 3240, auditeurs_pic: 1240, duree_moy_min: 42, temps_total_heures: 124, rediffusions: 3, taux_fidelite: 68 },
    audience_par_tranche: [
      { label: "16h-16h30", done: 820, total: 1240, color: "#F0A93E" },
      { label: "16h30-17h", done: 1240, total: 1240, color: "#1E9D55" },
      { label: "17h-17h30", done: 980, total: 1240, color: "#163A2C" },
    ],
    repartition_source: [
      { label: "FM 102.3", done: 1850, total: 3240, color: "#163A2C" },
      { label: "Streaming Web", done: 890, total: 3240, color: "#F0A93E" },
      { label: "App Mobile", done: 500, total: 3240, color: "#1E9D55" },
    ],
    intervenants: [
      { id: 1, name: "Père Attobra", subText: "Animateur principal • Louange", href: "/admin/users/1" },
      { id: 2, name: "Chorale Grâce-Espoir", subText: "4 chanteurs • Choeur", href: "/admin/users/2" },
      { id: 3, name: "Jonas Monnet", subText: "Technicien son • Régie", href: "/admin/users/3" },
    ],
    historique: [
      { date: "20 Juil", auditeurs: 2890, duree: "1h28" },
      { date: "13 Juil", auditeurs: 3120, duree: "1h32" },
      { date: "06 Juil", auditeurs: 3240, duree: "1h30" },
    ]
  }
};

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#163A2C]/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#F0A93E] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text- font-black text-[#163A2C]/60 w-8">{pct}%</span>
    </div>
  );
}

export default function EmissionDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const data = MOCK_EMISSIONS_DETAIL[id]?? MOCK_EMISSIONS_DETAIL["1"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2.5 bg-white border border-[#163A2C]/10 rounded-xl hover:bg-[#FBF6EA] transition">
          <ArrowLeft size={18} className="text-[#163A2C]" />
        </button>
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#163A2C] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#163A2C] leading-tight">{data.title}</h1>
            <p className="text- text-[#163A2C]/60 flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0A93E]/15 text-[#9A6A1E] text- font-black uppercase"><RadioTower size={10}/> {data.category}</span>
              {data.jour} • {data.horaire} • {data.animateur}
            </p>
          </div>
        </div>
      </div>

      {/* Stats principales — StatsCard existant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Auditeurs totaux" value={data.stats.auditeurs_total.toLocaleString("fr-FR")} />
        <StatsCard label="Pic d'audience" value={data.stats.auditeurs_pic.toString()} />
        <StatsCard label="Durée moyenne" value={`${data.stats.duree_moy_min} min`} />
        <StatsCard label="Heures écoutées" value={`${data.stats.temps_total_heures}h`} />
      </div>

      {/* Ligne 2 — audience + source + intervenants — DonutCard + ListCard existants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutCard
          title="Audience par tranche"
          subtitle="Auditeurs / Pic"
          viewAllText=""
          segments={data.audience_par_tranche}
        />
        <DonutCard
          title="Sources d'écoute"
          subtitle="FM vs Digital"
          viewAllText=""
          segments={data.repartition_source}
        />
        <ListCard
          title="Intervenants"
          viewAllText={`${data.intervenants.length} personnes`}
          viewAllHref={ROUTES.ADMIN.PROJETS}
          items={data.intervenants}
        />
      </div>

      {/* Ligne 3 — temps parcouru + historique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temps parcouru — card custom mais utilise même style que tes cards */}
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-[#163A2C] text- flex items-center gap-2"><Timer size={16} className="text-[#F0A93E]"/> Temps parcouru — engagement</h3>
            <span className="text- font-bold px-2.5 py-1 rounded-full bg-[#1E9D55]/10 text-[#1E5A3D]">{data.stats.taux_fidelite}% fidélité</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/5">
                <p className="text- font-black uppercase text-[#163A2C]/40 flex items-center gap-1"><Headphones size={10}/> Entrées</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">{data.stats.auditeurs_total}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/5">
                <p className="text- font-black uppercase text-[#163A2C]/40 flex items-center gap-1"><Clock size={10}/> Moyenne</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">{data.stats.duree_moy_min} min</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/5">
                <p className="text- font-black uppercase text-[#163A2C]/40 flex items-center gap-1"><TrendingUp size={10}/> Rediffs</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">x{data.stats.rediffusions}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {data.audience_par_tranche.map((t: any) => (
                <div key={t.label} className="flex items-center justify-between">
                  <span className="text- font-semibold text-[#163A2C]/70 w-">{t.label}</span>
                  <div className="flex-1 mx-3"><MiniBar value={t.done} max={t.total} /></div>
                  <span className="text- font-black text-[#163A2C] w-12 text-right">{t.done}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historique audiences */}
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#163A2C]/5 flex items-center justify-between">
            <h3 className="font-black text-[#163A2C] text- flex items-center gap-2"><Activity size={16} className="text-[#163A2C]"/> Historique dernières diffusions</h3>
            <span className="text- font-bold text-[#163A2C]/40 uppercase">3 dernières</span>
          </div>
          <div className="divide-y divide-[#163A2C]/5">
            {data.historique.map((h: any) => (
              <div key={h.date} className="px-6 py-4 flex items-center justify-between hover:bg-[#FBF6EA]/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#163A2C]/5 flex items-center justify-center">
                    <Calendar size={14} className="text-[#163A2C]/60" />
                  </div>
                  <div>
                    <p className="text- font-bold text-[#163A2C]">{h.date}</p>
                    <p className="text- text-[#163A2C]/50">{h.duree} d'émission</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text- font-black text-[#163A2C]">{h.auditeurs.toLocaleString("fr-FR")} aud.</p>
                  <div className="mt-1 w-24"><MiniBar value={h.auditeurs} max={4000} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-[#FBF6EA] flex items-center gap-2 text- font-bold text-[#163A2C]/60">
            <Mic2 size={12} /> Moyenne glissante: {(data.historique.reduce((a: number, b: any) => a + b.auditeurs, 0) / data.historique.length).toFixed(0)} auditeurs
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm p-6">
        <p className="text- font-black uppercase tracking-widest text-[#163A2C]/40 mb-2">Description émission</p>
        <p className="text-sm text-[#163A2C]/80 leading-relaxed">{data.description}</p>
      </div>
    </div>
  );
}