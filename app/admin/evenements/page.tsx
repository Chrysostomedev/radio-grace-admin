"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/cards/StatsCard";
import ReusableForm from "@/components/form/ReusableForm";
import MainCard from "@/components/cards/MainCard";
import { Filter, Plus, X } from "lucide-react";
import type { FieldConfig } from "@/components/form/ReusableForm";
import { useEvenements } from "@/hooks/admin/useEvenements";
import axios from "@/core/axios";

// Types pour calendrier
function fullName(u?: any) {
  if (!u) return "—";
  return u.nom_complet || `${u.first_name??u.prenom??""} ${u.last_name??u.nom??""}`.trim() || "—";
}
function formatDateLabel(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function AdminEvenementsPage() {
  const router = useRouter();
  const { evenements, loading, filtreType, setFiltreType, refresh, create, update, remove } = useEvenements();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [formInitValues, setFormInitValues] = useState<Record<string, any>>({});
  const [personnel, setPersonnel] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/admin/animateurs").then(r => setPersonnel(r.data.data || r.data || []));
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFiltersOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const TYPE_OPTIONS = [
    { id: "all", name: "Tous les types" },
    { id: "CONCERT", name: "Concert / Louange" },
    { id: "RETRAITE", name: "Retraite Spirituelle" },
    { id: "MESSE", name: "Messe spéciale" },
    { id: "FORMATION", name: "Formation" },
    { id: "DIRECT", name: "Direct extérieur" },
  ];

  const filtered = useMemo(() => evenements, [evenements]);

  const stats = {
    total: evenements.length,
    aVenir: evenements.filter(e => new Date(e.date_debut) > new Date()).length,
    encours: evenements.filter(e => { const now = new Date(); return new Date(e.date_debut) <= now && new Date(e.date_fin) >= now; }).length,
  };

  const eventFields: FieldConfig[] = [
    { name: "type", label: "Type d'événement RGE", type: "select", required: true, options: TYPE_OPTIONS.filter(t=>t.id!=="all").map(t=>({ label: t.name, value: t.id })) },
    { name: "titre", label: "Thème / Titre", type: "text", required: true, gridSpan: 2 },
    { name: "date_debut", label: "Date début", type: "date", required: true },
    { name: "date_fin", label: "Date fin", type: "date", required: true },
    { name: "lieu", label: "Lieu", type: "text", required: true },
    { name: "responsable_id", label: "Responsable / Animateur", type: "select", required: false, options: personnel.map(p => ({ label: p.nom_complet || p.nom, value: p.id })) },
    { name: "description", label: "Description", type: "textarea", gridSpan: 2 },
  ];

  // Map vers MainCard.plannings
  const planningsForCalendar = filtered.map((e:any) => ({
    id: e.id,
    codification: e.titre || e.theme,
    date_debut: e.date_debut,
    date_fin: e.date_fin,
    status: e.statut || "EN_COURS",
    provider_id: e.responsable?.id ?? 0,
    site_id: 1,
    company_asset_id: 1,
    responsable_name: fullName(e.responsable),
    responsable_phone: e.responsable?.telephone,
    description: e.description,
    provider: { id: e.responsable?.id ?? 0, company_name: e.type ?? "Événement", user: { first_name: e.responsable?.nom ?? "", last_name: "" } },
    site: { id: 1, nom: e.lieu },
  }));

  const handleCreate = async (data: Record<string, any>) => {
    await create(data);
    await refresh();
    setShowCreate(false); setFormInitValues({});
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!selectedEvent) return;
    await update(selectedEvent.id, data);
    await refresh();
    setShowEdit(false); setSelectedEvent(null);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await remove(selectedEvent.id);
    await refresh();
    setSelectedEvent(null);
  };

  const typeOptions = TYPE_OPTIONS.map(t => ({ label: t.name, value: String(t.id) }));

  return (
    <>
      <ReusableForm isOpen={showCreate} onClose={()=>{ setShowCreate(false); setFormInitValues({}); }} title="Nouvel événement RGE" subtitle="Programmez un événement Radio Grâce-Espoir" fields={eventFields} onSubmit={handleCreate} submitLabel="Créer" initialValues={formInitValues} />
      <ReusableForm isOpen={showEdit} onClose={()=>{ setShowEdit(false); setSelectedEvent(null); }} title="Modifier l'événement RGE" subtitle="Mettez à jour les détails de l'événement" fields={eventFields} onSubmit={handleUpdate} submitLabel="Mettre à jour" initialValues={selectedEvent? { ...selectedEvent, responsable_id: selectedEvent.responsable?.id } : {}} />

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard label="Total événements RGE" value={stats.total} delta={`${stats.encours} en cours`} />
          <StatsCard label="À venir" value={stats.aVenir} trend="up" />
          <StatsCard label="Types RGE" value={TYPE_OPTIONS.length-1} />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {filtreType==="all"? <p className="text-xs text-[#163A2C]/40 font-medium">Aucun filtre actif</p> :
              <span className="flex items-center gap-1.5 bg-[#163A2C] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {TYPE_OPTIONS.find(t=>t.id===filtreType)?.name} <button onClick={()=>setFiltreType("all")}><X size={11}/></button>
              </span>
            }
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={filterRef}>
              <button onClick={()=>setFiltersOpen(!filtersOpen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold ${filtersOpen||filtreType!=="all"? "bg-[#163A2C] text-white" : "bg-white text-[#163A2C]"}`}><Filter size={16}/> Filtrer</button>
              {filtersOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white border border-[#163A2C]/10 rounded-2xl shadow-xl p-4 space-y-2">
                  {TYPE_OPTIONS.map(o=>(
                    <button key={o.id} onClick={()=>{ setFiltreType(o.id); setFiltersOpen(false); }} className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold ${filtreType===o.id? "bg-[#163A2C] text-white" : "bg-[#FBF6EA]"}`}>{o.name}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0A93E] text-[#163A2C] text-sm font-bold"><Plus size={16}/> Nouvel événement</button>
          </div>
        </div>

        <MainCard
          plannings={planningsForCalendar}
          isLoading={loading}
          selectedEvent={selectedEvent || undefined}
          isPanelOpen={showEdit}
          onEventClick={(e: any)=> router.push(`/admin/evenements/${e.id}`)}
          onPanelClose={()=>{}}
          onEventDrop={async()=>{}}
          canAddEvent={true}
          onEventAdd={(date: Date)=>{ const d=date.toISOString().slice(0,10); setFormInitValues({ date_debut: d, date_fin: d }); setShowCreate(true); }}
          onEditClick={()=>{}}
          onDeleteClick={()=>{}}
        />
      </div>
    </>
  );
}