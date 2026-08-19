"use client";
import { Star, Heart, Plus, Eye, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ProduitRGE {
  id: number;
  name: string;
  category: string;
  prix: number;
  old_prix?: number;
  stock: number;
  note: number;
  ventes: number;
  image: string;
  badge: any; // string ou objet
  on_time: number;
}

const BADGE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  nouveau: { label: "Nouveau", bg: "bg-[#163A2C]", text: "text-white" },
  promo: { label: "Promo", bg: "bg-red-500", text: "text-white" },
  bestseller: { label: "Best-seller", bg: "bg-[#F0A93E]", text: "text-[#163A2C]" },
  stock: { label: "Stock faible", bg: "bg-slate-100", text: "text-slate-500" },
  rupture: { label: "Rupture", bg: "bg-red-600", text: "text-white" },
};

function normalizeBadge(raw: any) {
  if (!raw) return null;
  if (typeof raw === 'object' && raw.bg) return raw;
  const key = String(raw.label || raw).toLowerCase();
  if (key.includes("rupture")) return BADGE_CFG.rupture;
  if (key.includes("stock") || key.includes("faible")) return BADGE_CFG.stock;
  if (key.includes("bestseller") || key.includes("best")) return BADGE_CFG.bestseller;
  if (key.includes("%") || key.includes("promo") || key.includes("reduction")) return { label: typeof raw === 'string'? raw : raw.label, bg: "bg-red-500", text: "text-white" };
  return BADGE_CFG[key] || { label: String(raw.label || raw), bg: "bg-[#163A2C]", text: "text-white" };
}

function Stars({ note }: { note: number }) {
  return <div className="flex gap-0.5">{[1,2,3,4,5].map(i=> <Star key={i} size={12} className={i<=note? "fill-[#F0A93E] text-[#F0A93E]" : "text-black/10"} />)}</div>;
}

export default function BoutiqueCard({ produit, onAdd }: { produit: ProduitRGE; onAdd?: (p: ProduitRGE)=>void }) {
  const badge = normalizeBadge(produit.badge);
  const router = useRouter();
  return (
    <div className="group bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden hover:shadow-[0_16px_32px_rgba(22,58,44,0.12)] hover:-translate-y-1 transition-all flex flex-col">
      <div className="relative h-48 bg-[#FBF6EA] overflow-hidden">
        <img src={produit.image} alt={produit.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
        {badge && (
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text- font-black uppercase ${badge.bg} ${badge.text}`}>{badge.label}</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
          <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-[#163A2C] hover:text-white"><Heart size={14}/></button>
          <button onClick={()=>router.push(`/admin/boutique/${produit.id}`)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"><Eye size={14}/></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="text-white text- font-bold flex items-center gap-1"><Package size={11}/> {produit.stock} en stock</span>
          <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text- font-black text-[#163A2C] flex items-center gap-1"><Stars note={produit.note || 5}/> {produit.note || 5}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text- font-black uppercase tracking-widest text-[#163A2C]/40">{produit.category}</p>
        <h3 className="font-black text-[#163A2C] text- leading-tight mt-1 line-clamp-2 group-hover:text-[#9A6A1E] transition">{produit.name}</h3>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-[#FBF6EA] rounded-xl p-2 text-center"><p className="text-xs font-black text-[#163A2C]">{produit.ventes}</p><p className="text- font-bold uppercase text-[#163A2C]/40">Ventes</p></div>
          <div className="bg-[#1E9D55]/10 rounded-xl p-2 text-center"><p className="text-xs font-black text-[#1E5A3D]">{produit.stock}</p><p className="text- font-bold uppercase text-[#1E5A3D]/60">Stock</p></div>
          <div className="bg-[#F0A93E]/15 rounded-xl p-2 text-center"><p className="text-xs font-black text-[#9A6A1E]">{produit.on_time}%</p><p className="text- font-bold uppercase">Dispo</p></div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div><p className="font-black text-[#163A2C] text-sm">{Number(produit.prix).toLocaleString()} FCFA</p>{produit.old_prix && <p className="text- line-through text-[#163A2C]/30">{Number(produit.old_prix).toLocaleString()}</p>}</div>
          <button onClick={()=>onAdd?.(produit)} className="w-10 h-10 rounded-full bg-[#163A2C] text-white flex items-center justify-center hover:bg-[#F0A93E] hover:text-[#163A2C] transition shadow"><Plus size={18}/></button>
        </div>
      </div>
    </div>
  );
}