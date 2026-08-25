"use client";
import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, List, Filter } from "lucide-react";
import ActualiteCard, { ActualiteSummary } from "@/components/cards/ActualiteCard";
import ReusableForm, { FieldConfig } from "@/components/form/ReusableForm";
import Paginate from "@/components/data/paginate";
import { useRouter } from "next/navigation";

const MOCK_ACTUS: ActualiteSummary[] = [
  { id: 1, name: "Retraite des Leaders 2026 à Daoa : mobilisation générale", initials: "RL", color: "bg-[#163A2C]", category: "diocese", total: 3420, en_cours: 240, terminees: 89, en_retard: 12, priority: "high", date: "24 Juil", image: "/img/actus/retraite.jpg" },
  { id: 2, name: "Message du Pape pour la jeunesse africaine", initials: "VA", color: "bg-[#1E9D55]", category: "vatican", total: 1200, en_cours: 98, terminees: 34, en_retard: 5, priority: "medium", date: "22 Juil", image: "/img/actus/pape.jpg" },
  { id: 3, name: "Acclamez le Seigneur : nouvelle saison", initials: "AS", color: "bg-[#F0A93E]", category: "eglise", total: 890, en_cours: 67, terminees: 21, en_retard: 3, priority: "low", date: "20 Juil", image: "/img/actus/acclamez.jpg" },
];

export default function ActualitesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => MOCK_ACTUS.filter(a =>
    (cat==="all"||a.category===cat) && a.name.toLowerCase().includes(search.toLowerCase())
  ), [search, cat]);

  const paginated = filtered.slice((page-1)*8, page*8);

  const FIELDS: FieldConfig[] = [
    { name: "name", label: "Titre actualité", type: "text", required: true, placeholder: "Titre..." },
    { name: "category", label: "Catégorie", type: "select", required: true, options: [{label:"Diocèse Daoa",value:"diocese"},{label:"Église",value:"eglise"},{label:"Vatican",value:"vatican"},{label:"Laïcat",value:"laicat"}] },
    { name: "priority", label: "Mise en avant", type: "select", options: [{label:"À la une",value:"high"},{label:"Important",value:"medium"},{label:"Standard",value:"low"}] },
    { name: "image", label: "Image de couverture", type: "image-upload", placeholder: "JPG/PNG max 5MB" },
    { name: "content", label: "Contenu", type: "rich-text", gridSpan: 2, placeholder: "Rédigez l'actualité..." },
  ];

  return (
    <>
      <ReusableForm isOpen={showForm} onClose={()=>setShowForm(false)} title="Nouvelle actualité RGE" subtitle="Publiez une actualité pour le site et l'app" fields={FIELDS} onSubmit={async (d)=>{ console.log(d); setShowForm(false); }} submitLabel="Publier l'actualité" />

      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163A2C]/30"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher actualité..." className="w-full pl-11 pr-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl text- focus:border-[#F0A93E] outline-none"/>
          </div>
          <div className="flex bg-white border border-[#163A2C]/10 rounded-xl p-1">
            <button onClick={()=>setView("list")} className={`p-2 rounded-lg ${view==="list"? "bg-[#163A2C] text-white":"text-[#163A2C]/40"}`}><List size={16}/></button>
            <button onClick={()=>setView("grid")} className={`p-2 rounded-lg ${view==="grid"? "bg-[#F0A93E] text-[#163A2C]":"text-[#163A2C]/40"}`}><LayoutGrid size={16}/></button>
          </div>
          <button onClick={()=>setShowForm(true)} className="px-5 py-3 bg-[#F0A93E] text-[#163A2C] rounded-xl font-bold text- flex items-center gap-2"><Plus size={16}/> Nouvelle actu</button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {["all","diocese","eglise","vatican","laicat"].map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`px-4 py-2 rounded-full text- font-semibold border ${cat===c? "bg-[#163A2C] text-white":"bg-white text-[#163A2C]/60 border-[#163A2C]/10"}`}>{c==="all"? "Toutes": c}</button>
          ))}
        </div>

        {view==="grid"? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(a=> <ActualiteCard key={a.id} actualite={a} />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#FBF6EA]"><tr><th className="p-3 text-left text- uppercase text-[#163A2C]/50">Titre</th><th className="p-3 text-left text- uppercase">Cat</th><th className="p-3 text-left text- uppercase">Vues</th></tr></thead>
              <tbody>{paginated.map(a=>(
                <tr key={a.id} onClick={()=>router.push(`/admin/actualites/${a.id}`)} className="border-t border-black/5 hover:bg-[#FBF6EA]/50 cursor-pointer">
                  <td className="p-3 font-bold text- text-[#163A2C]">{a.name}</td>
                  <td className="p-3 text-">{a.category}</td>
                  <td className="p-3 text-">{a.total}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center"><Paginate currentPage={page} totalPages={Math.ceil(filtered.length/8)} onPageChange={setPage} /></div>
      </div>
    </>
  );
}