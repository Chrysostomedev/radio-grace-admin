"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, LayoutGrid, List, Filter, X } from "lucide-react";
import EmissionCard from "@/components/cards/EmissionCard";
import Paginate from "@/components/data/paginate";
import ReusableForm from "@/components/form/ReusableForm";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { useProgrammes, useAnimateurs } from "@/hooks/admin/useProgrammes";
import { useToast } from "@/context/ToastContext";
import type { FieldConfig } from "@/components/form/ReusableForm";
import type { Programme } from "@/types/admin";

const CATEGORIES = [
  { id: "all", label: "Toutes" },
  { id: "ACCLAMEZ", label: "Acclamez" },
  { id: "PRIERE", label: "Prière" },
  { id: "JEUNESSE", label: "Jeunesse" },
  { id: "ACTUALITE", label: "Actualités" },
  { id: "MUSIQUE", label: "Musique" },
] as const;

const JOURS = [
  { id: "all", label: "Tous les jours" },
  { id: "LUNDI", label: "Lundi" },
  { id: "MARDI", label: "Mardi" },
  { id: "MERCREDI", label: "Mercredi" },
  { id: "JEUDI", label: "Jeudi" },
  { id: "VENDREDI", label: "Vendredi" },
  { id: "SAMEDI", label: "Samedi" },
  { id: "DIMANCHE", label: "Dimanche" },
] as const;

export default function EmissionsPage() {
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [jour, setJour] = useState<string>("all");
  const { programmes, loading, search, setSearch, categorie, setCategorie, page, setPage, lastPage, create, update, remove } = useProgrammes();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Programme | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const animateurs = useAnimateurs() || [];

  const safeProgrammes = useMemo(() => Array.isArray(programmes)? programmes : [], [programmes]);

  const filtered = useMemo(() => {
    if (jour === "all") return safeProgrammes;
    return safeProgrammes.filter((e) => e.grille?.some((g) => g.jour === jour));
  }, [safeProgrammes, jour]);

  const paginated = filtered;
  const totalPages = lastPage || 1;

  const FIELDS: FieldConfig[] = [
    { name: "titre", label: "Titre émission", type: "text", required: true, placeholder: "Ex: Acclamez le Seigneur" },
    { name: "categorie", label: "Catégorie", type: "select", required: true, options: CATEGORIES.filter(c => c.id!== "all").map(c => ({ label: c.label, value: c.id as string })) },
    { name: "statut", label: "Statut", type: "select", required: true, options: [
      { label: "Actif", value: "ACTIF" },
      { label: "En direct", value: "EN_DIRECT" },
      { label: "Rediffusion", value: "REDIFFUSION" },
      { label: "Inactif", value: "INACTIF" },
    ]},
    { 
      name: "animateur_id", 
      label: "Animateur", 
      type: "select", 
      required: true, 
      disabled: !animateurs || animateurs.length === 0,
      options: (animateurs && animateurs.length > 0) 
        ? animateurs.map(a => ({ label: a.nom_scene || a.name || "Sans nom", value: String(a.id) }))
        : [], 
      placeholder: animateurs && animateurs.length === 0 ? "Chargement..." : "Choisir un animateur" 
    },
    { name: "image", label: "MÉDIA - AFFICHE / AUDIO / VIDÉO", type: "media", accept: "image/*,audio/*,video/*", previewType: "auto", gridSpan: 2 },
    { name: "description", label: "Description", type: "textarea", gridSpan: 2 },
  ];

  const handleSubmit = async (formDataObj: any) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      
      // Ajouter tous les champs au FormData
      Object.entries(formDataObj).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") return;
        
        // Si c'est un File ou Blob, l'ajouter directement
        if (v instanceof File || v instanceof Blob) {
          fd.append(k, v);
        } else {
          // Sinon, convertir en string
          fd.append(k, String(v));
        }
      });

      if (editing) {
        await update(editing.id, fd);
        toast.success(`Émission "${formDataObj.titre}" mise à jour`, "Succès");
      } else {
        await create(fd);
        toast.success(`Nouvelle émission "${formDataObj.titre}" créée`, "Création réussie");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      const errorMsg = err?.errorMessage || err?.message || "Une erreur est survenue";
      toast.error(errorMsg, "Erreur d'enregistrement");
      console.error("❌ Erreur création/modification émission:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const mapToCard = (p: Programme) => ({
    id: p.id,
    title: p.titre,
    category: p.categorie?.toLowerCase() as any,
    jour: (p.grille?.[0]?.jour?.toLowerCase() as any) || "lundi",
    status: p.en_direct? "live" : p.statut === "ACTIF"? "active" : p.statut === "REDIFFUSION"? "replay" : "pending",
    horaire: p.grille?.[0]? `${p.grille[0].heure_debut} - ${p.grille[0].heure_fin}` : "-",
    animateur: p.animateur?.nom_scene || "-",
    description: p.description || "",
    image: p.image || "/images/emission (3).jpg",
    created_by: "RGE",
    last_updated: "",
    messages_count: p.podcasts_count || 0,
    participants: [],
  });

  return (
    <>
      <ReusableForm isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing? "Modifier l'émission" : "Nouvelle émission RGE"} subtitle="Audio, Vidéo avec preview moderne" fields={FIELDS} initialValues={editing? {...editing, animateur_id: editing.animateur?.id } : {}} onSubmit={handleSubmit} isSubmitting={submitting} submitLabel={editing? "Mettre à jour" : "Créer l'émission"} />
      <ConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={async () => { 
          if (deleteTarget) { 
            try {
              await remove(deleteTarget.id);
              toast.success(`Émission "${deleteTarget.titre}" supprimée`, "Suppression réussie");
              setDeleteTarget(null);
            } catch (err: any) {
              const errorMsg = err?.errorMessage || err?.message || "Erreur lors de la suppression";
              toast.error(errorMsg, "Erreur");
              console.error("❌ Erreur suppression:", err);
            }
          } 
        }} 
        title="Supprimer l'émission" 
        message={`Supprimer « ${deleteTarget?.titre} »?`} 
        confirmLabel="Supprimer" 
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <p className="text- font-black text-[#163A2C]/40 uppercase">Total Émissions</p>
            <p className="text-3xl font-black text-[#163A2C] mt-1">{String(safeProgrammes.length).padStart(2, "0")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <p className="text- font-black text-[#163A2C]/40 uppercase">En direct</p>
            <p className="text-3xl font-black text-[#163A2C] mt-1">{String(safeProgrammes.filter(e => e.en_direct || e.statut === "EN_DIRECT").length).padStart(2, "0")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <p className="text- font-black text-[#163A2C]/40 uppercase">Filtrées</p>
            <p className="text-3xl font-black text-[#163A2C] mt-1">{String(filtered.length).padStart(2, "0")}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163A2C]/30" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher une émission, animateur..." className="w-full pl-11 pr-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl text-sm focus:outline-none focus:border-[#F0A93E]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-[#163A2C]/10 rounded-xl p-1">
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition ${view === "list"? "bg-[#163A2C] text-white" : "text-[#163A2C]/40"}`}><List size={16} /></button>
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition ${view === "grid"? "bg-[#F0A93E] text-[#163A2C]" : "text-[#163A2C]/40"}`}><LayoutGrid size={16} /></button>
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 bg-[#F0A93E] text-[#163A2C] rounded-xl font-bold text-sm hover:bg-[#E0972E] shadow-md whitespace-nowrap">
              <Plus size={16} strokeWidth={2.5} /> Nouvelle émission
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-4 space-y-4">
          <div className="flex items-center gap-2 text- font-black uppercase text-[#163A2C]/40"><Filter size={12}/> Catégories</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setCategorie(c.id as any); setPage(1); }} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition ${categorie===c.id? "bg-[#163A2C] text-white border-[#163A2C]" : "bg-[#FBF6EA] text-[#163A2C]/70 border-[#163A2C]/10 hover:border-[#F0A93E]/30"}`}>{c.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 text- font-black uppercase text-[#163A2C]/40"><Calendar size={12}/> Jours</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {JOURS.map(j => (
              <button key={j.id} onClick={() => { setJour(j.id); }} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition ${jour===j.id? "bg-[#F0A93E] text-[#163A2C] border-[#F0A93E]" : "bg-white text-[#163A2C]/60 border-[#163A2C]/10 hover:bg-[#FBF6EA]"}`}>{j.label}</button>
            ))}
          </div>
          {(categorie!=="all" || jour!=="all" || search) && (
            <button onClick={() => { setCategorie("all"); setJour("all"); setSearch(""); }} className="inline-flex items-center gap-1 text-xs font-bold text-[#163A2C]/60 hover:text-red-500"><X size={12}/> Réinitialiser les filtres</button>
          )}
        </div>

        {loading? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#163A2C]/10 text-[#163A2C]/40">Chargement RGE...</div>
        ) : view==="grid"? (
          filtered.length===0? (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#163A2C]/10 text-[#163A2C]/40">Aucune émission trouvée</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((em) => (
                  <EmissionCard key={em.id} emission={mapToCard(em) as any} onEdit={()=>{ setEditing(em); setShowForm(true); }} onDelete={()=> setDeleteTarget(em)} onPlay={()=>router.push(`/admin/emissions/${em.id}`)} />
                ))}
              </div>
              {totalPages>1 && <div className="flex justify-center pt-2"><Paginate currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
            </>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F0A93E]/15">
                  <th className="pl-5 pr-3 py-3 text-left w-8"><input type="checkbox" className="rounded" /></th>
                  {["Émission","Catégorie","Jour","Horaire","Animateur","Statut"].map(h=>(
                    <th key={h} className="px-3 py-3 text-left text- font-black text-[#163A2C]/60 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#163A2C]/5">
                {paginated.map((e)=> {
                  const card = mapToCard(e);
                  return (
                    <tr key={e.id} onClick={()=>router.push(`/admin/emissions/${e.id}`)} className="cursor-pointer hover:bg-[#FBF6EA]/60">
                      <td className="pl-5 py-4" onClick={ev=>ev.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                      <td className="px-3 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FBF6EA] relative shrink-0">
                          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-bold text-[#163A2C] truncate">{card.title}</span>
                      </td>
                      <td className="px-3 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#163A2C]/10 text-[#163A2C]">{e.categorie}</span></td>
                      <td className="px-3 py-4 text-sm text-[#163A2C]/70 capitalize">{card.jour}</td>
                      <td className="px-3 py-4 text-sm text-[#163A2C]/60">{card.horaire}</td>
                      <td className="px-3 py-4 text-sm text-[#163A2C]/70">{card.animateur}</td>
                      <td className="px-3 py-4"><span className={`px-2.5 py-1 rounded-full text- font-black uppercase ${card.status==="live"? "bg-red-500 text-white animate-pulse" : card.status==="active"? "bg-[#1E9D55]/15 text-[#1E5A3D]" : "bg-[#163A2C]/10 text-[#163A2C]/60"}`}>{card.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages>1 && <div className="px-5 py-4 border-t border-[#163A2C]/5 flex justify-center"><Paginate currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
          </div>
        )}
      </div>
    </>
  );
}