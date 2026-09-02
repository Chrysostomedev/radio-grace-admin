"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Headphones, Timer, TrendingUp, Activity, Calendar } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";
import DonutCard from "@/components/cards/DonutCard";
import ListCard from "@/components/cards/ListCard";
import { useProgramme } from "@/hooks/admin/useProgrammes";
import { RadioTower } from "lucide-react";

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0? Math.round((value / max) * 100) : 0;
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
  const { data: p, loading } = useProgramme(id);

  if (loading) return <div className="py-16 text-center bg-white rounded-2xl border border-[#163A2C]/10">Chargement RGE...</div>;
  if (!p) return <div className="py-16 text-center">Émission introuvable</div>;

  const data = {
    id: p.id,
    title: p.titre,
    category: p.categorie,
    jour: p.grille?.[0]?.jour || "TOUS",
    horaire: p.grille?.[0]? `${p.grille[0].heure_debut} - ${p.grille[0].heure_fin}` : "-",
    animateur: p.animateur?.nom_scene || p.animateur?.name || "Non assigné",
    image: p.image || p.photo || "/img/default-emission.jpg",
    description: p.description || "Aucune description",
    stats: p.stats || { auditeurs_total: p.vues || 0, auditeurs_pic: Math.round((p.vues || 0) * 0.38), duree_moy_min: 42, temps_total_heures: Math.round((p.vues || 0) * 0.042), rediffusions: p.grille?.filter((g: any) => g.is_rediffusion).length || 0, taux_fidelite: 68 },
    audience_par_tranche: p.grille?.length? p.grille.slice(0, 3).map((g: any, i: number) => ({ label: `${g.heure_debut}-${g.heure_fin}`, done: 800 + i * 100, total: 1240, color: ["#F0A93E", "#1E9D55", "#163A2C"][i % 3] })) : [
      { label: "16h-16h30", done: 820, total: 1240, color: "#F0A93E" },
      { label: "16h30-17h", done: 1240, total: 1240, color: "#1E9D55" },
      { label: "17h-17h30", done: 980, total: 1240, color: "#163A2C" },
    ],
    repartition_source: [
      // { label: "FM 102.3", done: Math.round((p.vues || 0) * 0.6), total: p.vues || 100, color: "#163A2C" },
      { label: "Streaming Web", done: Math.round((p.vues || 0) * 0.25), total: p.vues || 100, color: "#F0A93E" },
      { label: "App Mobile", done: Math.round((p.vues || 0) * 0.15), total: p.vues || 100, color: "#1E9D55" },
    ],
intervenants: p.animateur? [{ id: p.animateur.id, name: p.animateur.nom_scene || p.animateur.name, subText: `Animateur • ${p.categorie}`, href: `/admin/animateurs/${p.animateur.id}` }] : [],
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2.5 bg-white border border-[#163A2C]/10 rounded-xl hover:bg-[#FBF6EA] transition">
          <ArrowLeft size={18} className="text-[#163A2C]" />
        </button>
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#163A2C] shrink-0">
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#163A2C] leading-tight">{data.title}</h1>
            <p className="text- text-[#163A2C]/60 flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0A93E]/15 text-[#9A6A1E] text- font-black uppercase"><RadioTower size={10} /> {data.category}</span>
              {data.jour} • {data.horaire} • {data.animateur}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Auditeurs totaux" value={data.stats.auditeurs_total.toLocaleString("fr-FR")} />
        <StatsCard label="Pic d'audience" value={data.stats.auditeurs_pic.toString()} />
        {/* <StatsCard label="Durée moyenne" value={`${data.stats.duree_moy_min} min`} /> */}
        <StatsCard label="Heures écoutées" value={`${data.stats.temps_total_heures}h`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutCard title="Audience par tranche" subtitle="Auditeurs / Pic" viewAllText="" segments={data.audience_par_tranche} />
        <DonutCard title="Sources d'écoute" subtitle="FM vs Digital" viewAllText="" segments={data.repartition_source} />
        <ListCard title="Intervenants" viewAllText={`${data.intervenants.length} personnes`} viewAllHref="#" items={data.intervenants} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-[#163A2C] text-sm flex items-center gap-2"><Timer size={16} className="text-[#F0A93E]" /> Temps parcouru — engagement</h3>
            <span className="text- font-bold px-2.5 py-1 rounded-full bg-[#1E9D55]/10 text-[#1E5A3D]">{data.stats.taux_fidelite}% fidélité</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/5">
                <p className="text- font-black uppercase text-[#163A2C]/40 flex items-center gap-1"><Headphones size={10} /> Entrées</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">{data.stats.auditeurs_total}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/5">
                <p className="text- font-black uppercase text-[#163A2C]/40 flex items-center gap-1"><Clock size={10} /> Moyenne</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">{data.stats.duree_moy_min} min</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF6EA] border border-[#163A2C]/5">
                <p className="text- font-black uppercase text-[#163A2C]/40 flex items-center gap-1"><TrendingUp size={10} /> Rediffs</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">x{data.stats.rediffusions}</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {data.audience_par_tranche.map((t: any) => (
                <div key={t.label} className="flex items-center justify-between">
                  <span className="text- font-semibold text-[#163A2C]/70 w-20">{t.label}</span>
                  <div className="flex-1 mx-3"><MiniBar value={t.done} max={t.total} /></div>
                  <span className="text- font-black text-[#163A2C] w-12 text-right">{t.done}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#163A2C]/5 flex items-center justify-between">
            <h3 className="font-black text-[#163A2C] text-sm flex items-center gap-2"><Activity size={16} className="text-[#163A2C]" /> Grille de diffusion</h3>
            <span className="text- font-bold text-[#163A2C]/40 uppercase">{p.grille?.length || 0} créneaux</span>
          </div>
          <div className="divide-y divide-[#163A2C]/5">
            {(p.grille || []).map((h: any) => (
              <div key={h.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#FBF6EA]/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#163A2C]/5 flex items-center justify-center">
                    <Calendar size={14} className="text-[#163A2C]/60" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#163A2C]">{h.jour}</p>
                    <p className="text- text-[#163A2C]/50">{h.is_rediffusion? "Rediffusion" : "Direct"} • {h.heure_debut} - {h.heure_fin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text- font-black px-2 py-1 rounded-full ${h.is_rediffusion? "bg-[#163A2C]/10 text-[#163A2C]/60" : "bg-red-500 text-white animate-pulse"}`}>{h.is_rediffusion? "REPLAY" : "DIRECT"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm p-6">
        <p className="text- font-black uppercase tracking-widest text-[#163A2C]/40 mb-2">Description émission</p>
        <p className="text-sm text-[#163A2C]/80 leading-relaxed">{data.description}</p>
      </div>
    </div>
  );
}