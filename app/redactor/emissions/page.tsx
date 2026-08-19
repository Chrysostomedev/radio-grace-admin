"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, LayoutGrid, List, RadioTower, Filter, X } from "lucide-react";
import EmissionCard from "@/components/cards/EmissionCard";
import Paginate from "@/components/data/paginate";
import ReusableForm from "@/components/form/ReusableForm";
import ConfirmModal from "@/components/modals/ConfirmModal";
import type { FieldConfig } from "@/components/form/ReusableForm";

// ── Types mock RGE ──────────────────────────────────────────────────────────
type Emission = {
  id: number;
  title: string;
  category: "acclamez" | "priere" | "jeunesse" | "actualite" | "musique";
  jour: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
  status: "live" | "active" | "replay" | "pending";
  horaire: string;
  animateur: string;
  description: string;
  image: string;
  created_by: string;
  last_updated: string;
  messages_count: number;
  participants: string[];
};

const CATEGORIES = [
  { id: "all", label: "Toutes" },
  { id: "acclamez", label: "Acclamez" },
  { id: "priere", label: "Prière" },
  { id: "jeunesse", label: "Jeunesse" },
  { id: "actualite", label: "Actualités" },
  { id: "musique", label: "Musique" },
] as const;

const JOURS = [
  { id: "all", label: "Tous les jours" },
  { id: "lundi", label: "Lundi" },
  { id: "mardi", label: "Mardi" },
  { id: "mercredi", label: "Mercredi" },
  { id: "jeudi", label: "Jeudi" },
  { id: "vendredi", label: "Vendredi" },
  { id: "samedi", label: "Samedi" },
  { id: "dimanche", label: "Dimanche" },
] as const;

// ── MOCK STATIQUE RGE ───────────────────────────────────────────────────────
const MOCK_EMISSIONS: Emission[] = [
  { id: 1, title: "Acclamez le Seigneur", category: "acclamez", jour: "samedi", status: "live", horaire: "16:00 - 17:30", animateur: "Père Attobra", description: "Louange et adoration en direct depuis Daoa.", image: "/img/emissions/acclamez.jpg", created_by: "RGE", last_updated: "2026-07-24", messages_count: 48, participants: ["A","B","C"] },
  { id: 2, title: "Chapelet Matinal", category: "priere", jour: "lundi", status: "active", horaire: "05:30 - 06:00", animateur: "Marie N'Guessan", description: "Confions notre journée au Seigneur.", image: "/img/emissions/chapelet.jpg", created_by: "RGE", last_updated: "2026-07-23", messages_count: 12, participants: ["M"] },
  { id: 3, title: "Jeunesse en Marche", category: "jeunesse", jour: "vendredi", status: "replay", horaire: "19:00 - 20:00", animateur: "Jonas Monnet", description: "Parole aux jeunes du diocèse.", image: "/img/emissions/jeunesse.jpg", created_by: "RGE", last_updated: "2026-07-22", messages_count: 22, participants: ["J","K"] },
  { id: 4, title: "Flash Diocèse Daoa", category: "actualite", jour: "mercredi", status: "active", horaire: "12:00 - 12:15", animateur: "Studio RGE", description: "Toute l'actu de l'Église locale.", image: "/img/emissions/flash.jpg", created_by: "RGE", last_updated: "2026-07-24", messages_count: 5, participants: ["S"] },
  { id: 5, title: "Nuit de Gloire", category: "musique", jour: "dimanche", status: "pending", horaire: "21:00 - 23:00", animateur: "DJ Chrétien", description: "Musiques chrétiennes non-stop.", image: "/img/emissions/nuit.jpg", created_by: "RGE", last_updated: "2026-07-20", messages_count: 31, participants: ["A","B"] },
  { id: 6, title: "Parole de Vie", category: "priere", jour: "mardi", status: "active", horaire: "06:15 - 06:30", animateur: "Père Jean", description: "Méditation quotidienne de l'Évangile.", image: "/img/emissions/parole.jpg", created_by: "RGE", last_updated: "2026-07-24", messages_count: 9, participants: ["P"] },
];

export default function EmissionsPage() {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [jour, setJour] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Emission | null>(null);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return MOCK_EMISSIONS.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.animateur.toLowerCase().includes(search.toLowerCase());
      const matchCat = cat === "all" || e.category === cat;
      const matchJour = jour === "all" || e.jour === jour;
      return matchSearch && matchCat && matchJour;
    });
  }, [search, cat, jour]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const FIELDS: FieldConfig[] = [
    { name: "title", label: "Titre émission", type: "text", required: true, placeholder: "Ex: Acclamez le Seigneur" },
    { name: "category", label: "Catégorie", type: "select", options: CATEGORIES.filter(c => c.id!== "all").map(c => ({ label: c.label, value: c.id })) },
    { name: "jour", label: "Jour de diffusion", type: "select", options: JOURS.filter(j => j.id!== "all").map(j => ({ label: j.label, value: j.id })) },
    { name: "horaire", label: "Horaire", type: "text", placeholder: "16:00 - 17:30" },
    { name: "animateur", label: "Animateur", type: "text" },
    { name: "description", label: "Description", type: "textarea", gridSpan: 2 },
  ];

  return (
    <>
      <ReusableForm isOpen={showForm} onClose={() => setShowForm(false)} title="Nouvelle émission RGE" fields={FIELDS} onSubmit={async () => setShowForm(false)} submitLabel="Créer l'émission" />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => setDeleteTarget(null)} title="Supprimer l'émission" message={`Supprimer « ${deleteTarget?.title} »?`} confirmLabel="Supprimer" />

      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <p className="text- font-black text-[#163A2C]/40 uppercase">Total Émissions</p>
            <p className="text-3xl font-black text-[#163A2C] mt-1">{String(MOCK_EMISSIONS.length).padStart(2,"0")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <p className="text- font-black text-[#163A2C]/40 uppercase">En direct</p>
            <p className="text-3xl font-black text-[#163A2C] mt-1">{String(MOCK_EMISSIONS.filter(e=>e.status==="live").length).padStart(2,"0")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
            <p className="text- font-black text-[#163A2C]/40 uppercase">Cette semaine</p>
            <p className="text-3xl font-black text-[#163A2C] mt-1">{String(filtered.length).padStart(2,"0")}</p>
          </div>
        </div>

        {/* Search + View Toggle + Add */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163A2C]/30" />
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Rechercher une émission, animateur..." className="w-full pl-11 pr-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl text- focus:outline-none focus:border-[#F0A93E]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-[#163A2C]/10 rounded-xl p-1">
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition ${view==="list"? "bg-[#163A2C] text-white" : "text-[#163A2C]/40"}`}><List size={16} /></button>
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition ${view==="grid"? "bg-[#F0A93E] text-[#163A2C]" : "text-[#163A2C]/40"}`}><LayoutGrid size={16} /></button>
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 bg-[#F0A93E] text-[#163A2C] rounded-xl font-bold text- hover:bg-[#E0972E] shadow-md whitespace-nowrap">
              <Plus size={16} strokeWidth={2.5} /> Nouvelle émission
            </button>
          </div>
        </div>

        {/* SLIDE FILTRES */}
        <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-4 space-y-4">
          <div className="flex items-center gap-2 text- font-black uppercase text-[#163A2C]/40"><Filter size={12}/> Catégories</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setCat(c.id); setCurrentPage(1); }} className={`px-4 py-2 rounded-full text- font-semibold whitespace-nowrap border transition ${cat===c.id? "bg-[#163A2C] text-white border-[#163A2C]" : "bg-[#FBF6EA] text-[#163A2C]/70 border-[#163A2C]/10 hover:border-[#F0A93E]/30"}`}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text- font-black uppercase text-[#163A2C]/40"><Calendar size={12}/> Jours</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {JOURS.map(j => (
              <button key={j.id} onClick={() => { setJour(j.id); setCurrentPage(1); }} className={`px-4 py-2 rounded-full text- font-semibold whitespace-nowrap border transition ${jour===j.id? "bg-[#F0A93E] text-[#163A2C] border-[#F0A93E]" : "bg-white text-[#163A2C]/60 border-[#163A2C]/10 hover:bg-[#FBF6EA]"}`}>
                {j.label}
              </button>
            ))}
          </div>
          {(cat!=="all" || jour!=="all" || search) && (
            <button onClick={() => { setCat("all"); setJour("all"); setSearch(""); }} className="inline-flex items-center gap-1 text-xs font-bold text-[#163A2C]/60 hover:text-red-500"><X size={12}/> Réinitialiser les filtres</button>
          )}
        </div>

        {/* VIEW */}
        {view==="grid"? (
          filtered.length===0? (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#163A2C]/10 text-[#163A2C]/40">Aucune émission trouvée</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(em => (
                  <EmissionCard key={em.id} emission={em as any} onEdit={()=>{}} onDelete={(id)=> setDeleteTarget(filtered.find(f=>f.id===id)??null)} onPlay={()=>{}} />
                ))}
              </div>
              {totalPages>1 && <div className="flex justify-center pt-2"><Paginate currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
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
                {paginated.map(e=>(
                  <tr key={e.id} onClick={()=>router.push(`/admin/emissions/${e.id}`)} className="cursor-pointer hover:bg-[#FBF6EA]/60">
                    <td className="pl-5 py-4" onClick={ev=>ev.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                    <td className="px-3 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FBF6EA] relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.image} alt={e.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text- font-bold text-[#163A2C] truncate max-w-">{e.title}</span>
                    </td>
                    <td className="px-3 py-4"><span className="px-2.5 py-1 rounded-full text- font-bold bg-[#163A2C]/10 text-[#163A2C]">{e.category}</span></td>
                    <td className="px-3 py-4 text- text-[#163A2C]/70 capitalize">{e.jour}</td>
                    <td className="px-3 py-4 text- text-[#163A2C]/60">{e.horaire}</td>
                    <td className="px-3 py-4 text- text-[#163A2C]/70">{e.animateur}</td>
                    <td className="px-3 py-4"><span className={`px-2.5 py-1 rounded-full text- font-black uppercase ${e.status==="live"? "bg-red-500 text-white animate-pulse" : e.status==="active"? "bg-[#1E9D55]/15 text-[#1E5A3D]" : "bg-[#163A2C]/10 text-[#163A2C]/60"}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages>1 && <div className="px-5 py-4 border-t border-[#163A2C]/5 flex justify-center"><Paginate currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
          </div>
        )}
      </div>
    </>
  );
}