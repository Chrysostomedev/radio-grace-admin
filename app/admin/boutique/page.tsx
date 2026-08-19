"use client";
import { useState } from "react";
import BoutiqueCard from "@/components/cards/BoutiqueCard";
import CommandeSlider from "@/components/boutique/CommandeSlider";
import ReusableForm, { FieldConfig } from "@/components/form/ReusableForm";
import { Search, Plus, LayoutGrid, List } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";
import { useProduits } from "@/hooks/admin/useProduits";
import { produitService } from "@/services/admin/produit.service";
import { useRouter } from "next/navigation";

export default function BoutiquePage() {
  const router = useRouter();
  const { produits, loading, search, setSearch, categorie, setCategorie, refresh } = useProduits();
  const [view, setView] = useState<"grid"|"list">("grid");
  const [showForm, setShowForm] = useState(false);

  const FIELDS: FieldConfig[] = [
    { name: "name", label: "Nom produit (ex: Chapelet, Bible)", type: "text", required: true },
    { name: "categorie", label: "Catégorie", type: "select", required: true, options: [{label:"Livre",value:"livre"},{label:"Textile",value:"textile"},{label:"Audio",value:"audio"},{label:"Accessoire / Chapelet",value:"accessoire"},{label:"Bible",value:"bible"}] },
    { name: "prix", label: "Prix FCFA", type: "text", required: true },
    { name: "stock", label: "Stock", type: "text", required: true },
    { name: "images", label: "Images (plusieurs)", type: "media", accept: "image/*", previewType: "auto", multiple: true } as any,
    { name: "description", label: "Description", type: "textarea", gridSpan: 2 },
  ];

  const handleCreate = async (data: any) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("categorie", data.categorie);
    fd.append("prix", data.prix);
    fd.append("stock", data.stock);
    fd.append("description", data.description||"");
    if (data.images) {
      const files = Array.isArray(data.images)? data.images : [data.images];
      files.forEach((f: File)=> fd.append("images[]", f));
    }
    await produitService.create(fd);
    await refresh();
    setShowForm(false);
  };

  return (
    <>
      <ReusableForm isOpen={showForm} onClose={()=>setShowForm(false)} title="Nouveau produit RGE" fields={FIELDS} onSubmit={handleCreate} submitLabel="Ajouter produit" />

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard label="Produits" value={`${produits.length}`} />
          <StatsCard label="Rupture" value={`${produits.filter((p:any)=>p.stock<=0).length}`} />
          <StatsCard label="Stock faible" value={`${produits.filter((p:any)=>p.badge==="STOCK_FAIBLE").length}`} />
          <StatsCard label="Catégories" value="5" />
        </div>

        <CommandeSlider />

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163A2C]/30"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher bible, chapelet..." className="w-full pl-11 pr-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl text-sm outline-none focus:border-[#F0A93E]" /></div>
          <div className="flex gap-2">
            <div className="flex bg-white border border-[#163A2C]/10 rounded-xl p-1"><button onClick={()=>setView("grid")} className={`p-2 rounded-lg ${view==="grid"? "bg-[#163A2C] text-white":"text-[#163A2C]/40"}`}><LayoutGrid size={16}/></button><button onClick={()=>setView("list")} className={`p-2 rounded-lg ${view==="list"? "bg-[#F0A93E] text-[#163A2C]":"text-[#163A2C]/40"}`}><List size={16}/></button></div>
            <button onClick={()=>setShowForm(true)} className="px-5 py-3 bg-[#F0A93E] text-[#163A2C] rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={16}/> Nouveau produit</button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {["all","livre","bible","textile","audio","accessoire"].map(c=>(
            <button key={c} onClick={()=>setCategorie(c)} className={`px-4 py-2 rounded-full text-xs font-bold border ${categorie===c? "bg-[#163A2C] text-white":"bg-white text-[#163A2C]/60"}`}>{c==="all"? "Tous": c}</button>
          ))}
        </div>

        {loading? <div className="py-16 text-center bg-white rounded-2xl">Chargement...</div> : (
          <div className={view==="grid"? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "grid grid-cols-1 gap-3"}>
            {produits.map((p:any)=> {
              const mapped = {
                id: p.id,
                name: p.name,
                category: p.categorie,
                prix: p.prix,
                stock: p.stock,
                note: 5,
                ventes: p.ventes_count||0,
                image: p.image_principale?.url? (p.image_principale.url.startsWith("http")? p.image_principale.url : `/storage/${p.image_principale.url}`.replace("//storage","/storage")) : p.images?.[0]?.url? (p.images[0].url.startsWith("http")? p.images[0].url : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1","")}/storage/${p.images[0].url}`) : "/images/radio4.jpg",
                badge: p.badge?.toLowerCase(),
                on_time: p.dispo_percent,
              };
              return <div key={p.id} onClick={()=>router.push(`/admin/boutique/${p.id}`)}><BoutiqueCard produit={mapped as any} onAdd={()=>{}} /></div>;
            })}
          </div>
        )}
      </div>
    </>
  );
}