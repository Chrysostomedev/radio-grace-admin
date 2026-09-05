"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StatsCard from "@/components/cards/StatsCard";
import ReusableForm from "@/components/form/ReusableForm";
import MainCard from "@/components/cards/MainCard";
import ParticipantsModal from "@/components/modals/ParticipantsModal";
import { Filter, Plus, X, Users, Trash2 } from "lucide-react";
import type { FieldConfig } from "@/components/form/ReusableForm";
import { useEvenements } from "@/hooks/admin/useEvenements";
import { useAdminParticipants } from "@/hooks/useAdminParticipants";
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
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<any | null>(null);
  const { participants, loading: participantsLoading } = useAdminParticipants(selectedEventForParticipants?.id);

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

  // Action handler to open participants modal
  const handleShowParticipants = (event: any) => {
    setSelectedEventForParticipants(event);
    setShowParticipantsModal(true);
  };

  const eventFields: FieldConfig[] = useMemo(() => {
    const animateurOptions = Array.isArray(personnel) && personnel.length > 0
      ? personnel.map(p => ({ label: p.nom_complet || p.nom, value: String(p.id) }))
      : [{ label: "Chargement...", value: "" }];

    return [
    { name: "type", label: "Type d'événement RGE", type: "select", required: true, options: TYPE_OPTIONS.filter(t=>t.id!=="all").map(t=>({ label: t.name, value: t.id })) },
    { name: "titre", label: "Thème / Titre", type: "text", required: true, gridSpan: 2 },
    { name: "date_debut", label: "Date début", type: "date", required: true },
    { name: "date_fin", label: "Date fin", type: "date", required: true },
    { name: "lieu", label: "Lieu", type: "text", required: true },
    { name: "responsable_id", label: "Responsable / Animateur", type: "select", required: false, options: animateurOptions },
      { name: "image", label: "Image de l'événement", type: "image-upload", required: false, maxImages: 1, maxSizeMB: 5 },
      { name: "description", label: "Description", type: "textarea", gridSpan: 2 },
    ];
    }, [personnel]);

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
    const fd = new FormData();
    fd.append("type", data.type);
    fd.append("titre", data.titre);
    fd.append("date_debut", data.date_debut);
    fd.append("date_fin", data.date_fin);
    fd.append("lieu", data.lieu);
    if (data.responsable_id) fd.append("responsable_id", data.responsable_id);
    if (data.description) fd.append("description", data.description);
    
    // Handle image
    const img = data.image;
    if (Array.isArray(img) && img.length > 0) {
      const file = img[0] instanceof File ? img[0] : img[0]?.file;
      if (file) fd.append("image", file);
    } else if (img instanceof File) {
      fd.append("image", img);
    }
    
    await create(fd);
    await refresh();
    setShowCreate(false);
    setFormInitValues({});
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!selectedEvent) return;
    
    const fd = new FormData();
    fd.append("type", data.type);
    fd.append("titre", data.titre);
    fd.append("date_debut", data.date_debut);
    fd.append("date_fin", data.date_fin);
    fd.append("lieu", data.lieu);
    if (data.responsable_id) fd.append("responsable_id", data.responsable_id);
    if (data.description) fd.append("description", data.description);
    
    // Handle image
    const img = data.image;
    if (Array.isArray(img) && img.length > 0) {
      const file = img[0] instanceof File ? img[0] : img[0]?.file;
      if (file) fd.append("image", file);
    } else if (img instanceof File) {
      fd.append("image", img);
    }
    
    await update(selectedEvent.id, fd);
    await refresh();
    setShowEdit(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    try {
      await remove(selectedEvent.id);
      await refresh();
      setSelectedEvent(null);
      setShowEdit(false);
      toast.success("Événement supprimé");
    } catch (e: any) {
      toast.error("Erreur suppression");
    }
  };

  const typeOptions = TYPE_OPTIONS.map(t => ({ label: t.name, value: String(t.id) }));

  return (
    <>
      <ReusableForm isOpen={showCreate} onClose={()=>{ setShowCreate(false); setFormInitValues({}); }} title="Nouvel événement RGE" subtitle="Programmez un événement Radio Grâce-Espoir" fields={eventFields} onSubmit={handleCreate} submitLabel="Créer" initialValues={formInitValues && Object.keys(formInitValues).length > 0 ? {
        type: String(formInitValues.type || ""),
        titre: formInitValues.titre || "",
        date_debut: formInitValues.date_debut || "",
        date_fin: formInitValues.date_fin || "",
        lieu: formInitValues.lieu || "",
        responsable_id: formInitValues.responsable_id ? String(formInitValues.responsable_id) : "",
        description: formInitValues.description || "",
      } : {}} />
      <ReusableForm isOpen={showEdit} onClose={()=>{ setShowEdit(false); setSelectedEvent(null); }} title="Modifier l'événement RGE" subtitle="Mettez à jour les détails de l'événement" fields={eventFields} onSubmit={handleUpdate} submitLabel="Mettre à jour" initialValues={selectedEvent ? { 
        type: String(selectedEvent.type || ""),
        titre: selectedEvent.titre || "",
        date_debut: selectedEvent.date_debut ? selectedEvent.date_debut.split('T')[0] : "",
        date_fin: selectedEvent.date_fin ? selectedEvent.date_fin.split('T')[0] : "",
        lieu: selectedEvent.lieu || "",
        responsable_id: selectedEvent.responsable?.id ? String(selectedEvent.responsable.id) : "",
        description: selectedEvent.description || "",
        image: selectedEvent.image ? [{ preview: selectedEvent.image }] : undefined,
      } : {}} />
      
      {showEdit && selectedEvent && (
        <div className="fixed bottom-6 right-6 z-40 flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition flex items-center gap-2"
          >
            <Trash2 size={16} /> Supprimer
          </button>
        </div>
      )}
      
      <ParticipantsModal
        isOpen={showParticipantsModal}
        onClose={() => {
          setShowParticipantsModal(false);
          setSelectedEventForParticipants(null);
        }}
        eventTitle={selectedEventForParticipants?.titre || "Événement"}
        participants={participants}
        isLoading={participantsLoading}
      />

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
          selectedEvent={null}
          isPanelOpen={false}
          onEventClick={(e: any)=> router.push(`/admin/evenements/${e.id}`)}
          onPanelClose={()=>{}}
          onEventDrop={async()=>{}}
          canAddEvent={true}
          onEventAdd={(date: Date)=>{ const d=date.toISOString().slice(0,10); setFormInitValues({ date_debut: d, date_fin: d }); setShowCreate(true); }}
          onEditClick={()=>{}}
          onDeleteClick={()=>{}}
        />

        {/* Events Table with Participants Column */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-[#163A2C] mb-4">Événements & Participants</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#163A2C]/5 border-b-2 border-[#163A2C]/10">
                  <th className="text-left px-4 py-3 font-bold text-[#163A2C] text-sm">Titre</th>
                  <th className="text-left px-4 py-3 font-bold text-[#163A2C] text-sm">Date</th>
                  <th className="text-center px-4 py-3 font-bold text-[#163A2C] text-sm">Participants</th>
                  <th className="text-left px-4 py-3 font-bold text-[#163A2C] text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event: any) => (
                  <tr key={event.id} className="border-b border-[#163A2C]/5 hover:bg-[#F0A93E]/5 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-[#163A2C]">{event.titre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateLabel(event.date_debut)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleShowParticipants(event)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0A93E]/10 text-[#F0A93E] hover:bg-[#F0A93E]/20 transition font-semibold text-sm"
                      >
                        <Users size={16} />
                        Voir
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => { setSelectedEvent(event); setShowEdit(true); }}
                        className="text-[#F0A93E] font-semibold hover:underline"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}