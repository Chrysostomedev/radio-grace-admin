"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Clock, RadioTower, Users, Timer, Activity } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";
import DonutCard from "@/components/cards/DonutCard";
import ListCard from "@/components/cards/ListCard";
import { useEffect, useState } from "react";
import axios from "@/core/axios";

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0? Math.round((value/max)*100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#163A2C]/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#F0A93E] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text- font-black text-[#163A2C]/60 w-8">{pct}%</span>
    </div>
  );
}

export default function EvenementDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [e, setE] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/admin/evenements/${id}`).then(r => setE(r.data.data || r.data)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="py-16 text-center bg-white rounded-2xl border">Chargement RGE...</div>;
  if (!e) return <div className="py-16 text-center">Événement introuvable</div>;

  const durationDays = e.date_debut && e.date_fin? Math.ceil((new Date(e.date_fin).getTime() - new Date(e.date_debut).getTime())/86400000)+1 : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={()=>router.back()} className="p-2.5 bg-white border border-[#163A2C]/10 rounded-xl"><ArrowLeft size={18}/></button>
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#163A2C] shrink-0">
            <img src={e.image || "/images/emission (3).jpg"} alt={e.titre} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#163A2C]">{e.titre}</h1>
            <p className="text- text-[#163A2C]/60 flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0A93E]/15 text-[#9A6A1E] text- font-black uppercase"><RadioTower size={10}/> {e.type}</span>
              {new Date(e.date_debut).toLocaleDateString("fr-FR")} • {e.lieu || "Lieu non défini"} • {e.responsable?.nom_complet || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Statut" value={e.statut} />
        <StatsCard label="Durée" value={`${durationDays} jour(s)`} />
        <StatsCard label="Lieu" value={e.lieu || "—"} />
        <StatsCard label="Responsable" value={e.responsable?.nom_complet || "Non assigné"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutCard title="Planification" subtitle="Dates" viewAllText="" segments={[
          { label: "Préparation", done: 1, total: 2, color: "#F0A93E" },
          { label: "Événement", done: durationDays, total: 3, color: "#163A2C" },
        ]} />
        <DonutCard title="Type RGE" subtitle={e.type} viewAllText="" segments={[
          { label: e.type, done: 100, total: 100, color: "#1E9D55" },
        ]} />
        <ListCard title="Responsable" viewAllText="1 personne" viewAllHref="#" items={e.responsable? [{ id: e.responsable.id, name: e.responsable.nom_complet || e.responsable.nom, subText: "Responsable • RGE", href: "#" }] : []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-6">
          <h3 className="font-black text-[#163A2C] text-sm flex items-center gap-2 mb-4"><Timer size={16} className="text-[#F0A93E]"/> Détails</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#163A2C]/50">Début</span><span className="font-bold text-[#163A2C] flex items-center gap-1"><Calendar size={12}/>{new Date(e.date_debut).toLocaleDateString("fr-FR")}</span></div>
            <div className="flex justify-between"><span className="text-[#163A2C]/50">Fin</span><span className="font-bold text-[#163A2C] flex items-center gap-1"><Calendar size={12}/>{e.date_fin? new Date(e.date_fin).toLocaleDateString("fr-FR") : "—"}</span></div>
            <div className="flex justify-between"><span className="text-[#163A2C]/50">Lieu</span><span className="font-bold text-[#163A2C] flex items-center gap-1"><MapPin size={12}/>{e.lieu}</span></div>
            <div className="flex justify-between"><span className="text-[#163A2C]/50">Statut</span><span className={`px-2 py-1 rounded-full text- font-black uppercase ${e.statut==="EN_COURS"? "bg-red-500 text-white animate-pulse" : "bg-[#163A2C]/10 text-[#163A2C]"}`}>{e.statut}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#163A2C]/5 flex items-center justify-between">
            <h3 className="font-black text-[#163A2C] text-sm flex items-center gap-2"><Activity size={16}/> Historique</h3>
            <span className="text- font-bold text-[#163A2C]/40 uppercase">RGE</span>
          </div>
          <div className="p-6 text-sm text-[#163A2C]/70">
            Créé le {new Date(e.created_at).toLocaleDateString("fr-FR")} • Dernière modif {new Date(e.updated_at).toLocaleDateString("fr-FR")}
            <div className="mt-4"><MiniBar value={durationDays} max={5} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-6">
        <p className="text- font-black uppercase tracking-widest text-[#163A2C]/40 mb-2">Description</p>
        <p className="text-sm text-[#163A2C]/80 leading-relaxed">{e.description || "Aucune description"}</p>
      </div>
    </div>
  );
}