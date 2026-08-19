"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { produitService, commandeService } from "@/services/admin/produit.service";
import { ArrowLeft, Trash, ShoppingBag, Image as ImageIcon } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";

const resolveImage = (img: any): string => {
  if (!img) return "/images/radio4.jpg";
  const raw = typeof img === "string"? img : img.url;
  if (!raw) return "/images/radio4.jpg";
  return raw; // ton API renvoie déjà http://.../storage/...
};

export default function ProduitDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [p, setP] = useState<any>(null);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProduit = useCallback(async () => {
    const res = await produitService.getOne(id);
    setP(res.data.data || res.data);
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchProduit();
      const cmdRes = await commandeService.getAll({ per_page: 100 });
      const all = cmdRes.data.data || cmdRes.data || [];
      const filtered = all.filter((c:any)=> c.items?.some((it:any)=> String(it.produit?.id?? it.produit_id) === String(id)));
      setCommandes(filtered);
      setLoading(false);
    })();
  }, [id, fetchProduit]);

  const handleSetPrincipale = async (imgId: number) => {
    await produitService.images.setPrincipale(imgId, true);
    await fetchProduit();
  };
  const handleDeleteImg = async (imgId: number) => {
    await produitService.images.delete(imgId);
    await fetchProduit();
  };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await produitService.images.add(id, file);
    e.target.value = "";
    await fetchProduit();
  };

  if (loading) return <div className="py-16 text-center bg-white rounded-2xl">Chargement RGE...</div>;
  if (!p) return <div>Produit introuvable</div>;

  return (
    <div className="space-y-5">
      <button onClick={()=>router.back()} className="p-2.5 bg-white border border-[#163A2C]/10 rounded-xl"><ArrowLeft size={18}/></button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#163A2C]/10 p-6">
          <div className="flex gap-4">
            <img src={resolveImage(p.image_principale || p.images?.[0])} alt={p.name} className="w-28 h-28 rounded-xl object-cover bg-[#FBF6EA]" />
            <div>
              <h1 className="text-2xl font-black text-[#163A2C]">{p.name}</h1>
              <p className="text-sm text-[#163A2C]/60">{p.categorie} • {p.prix} FCFA • Stock {p.stock} • {p.dispo_percent}% dispo</p>
              <p className="mt-2 text-sm text-[#163A2C]/70 leading-relaxed">{p.description || "Aucune description"}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-black text-[#163A2C] flex items-center gap-2 text-sm"><ImageIcon size={16} className="text-[#F0A93E]"/> Images ({p.images?.length||0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {p.images?.map((img:any)=>(
                <div key={img.id} className={`relative rounded-xl overflow-hidden border-2 ${img.is_principale? "border-[#F0A93E]" : "border-[#163A2C]/10"}`}>
                  <img src={resolveImage(img)} alt="" className="w-full h-24 object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 flex justify-between items-center p-1">
                    <button onClick={()=>handleSetPrincipale(img.id)} className={`text- font-black px-2 py-1 rounded ${img.is_principale? "bg-[#F0A93E] text-[#163A2C]" : "bg-white/90 text-[#163A2C]"}`}>{img.is_principale? "PRINCIPALE" : "Définir"}</button>
                    <button onClick={()=>handleDeleteImg(img.id)} className="p-1.5 bg-red-500 rounded text-white"><Trash size={10}/></button>
                  </div>
                </div>
              ))}
              <label className="h-24 rounded-xl border-2 border-dashed border-[#163A2C]/20 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FBF6EA] gap-1">
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <span className="text-xl">+</span>
                <span className="text- font-bold text-[#163A2C]/60 uppercase">Ajouter</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatsCard label="Prix" value={`${p.prix} FCFA`} />
          <StatsCard label="Stock" value={`${p.stock}`} delta={p.badge||""} />
          <StatsCard label="Commandes" value={`${commandes.length}`} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#163A2C]/5 flex items-center justify-between">
          <h3 className="font-black text-[#163A2C] flex items-center gap-2 text-sm"><ShoppingBag size={16}/> Commandes contenant ce produit</h3>
          <span className="text-xs bg-[#163A2C] text-white px-3 py-1 rounded-full font-bold">{commandes.length}</span>
        </div>
        <div className="divide-y divide-[#163A2C]/5">
          {commandes.map((c:any)=>(
            <div key={c.id} onClick={()=>router.push(`/admin/commandes/${c.id}`)} className="px-6 py-4 flex items-center justify-between hover:bg-[#FBF6EA]/50 cursor-pointer">
              <div>
                <p className="font-bold text-[#163A2C] text-sm">{c.code} - {c.client_nom}</p>
                <p className="text-xs text-[#163A2C]/50">{new Date(c.created_at).toLocaleDateString("fr-FR")} • {c.statut} • {c.total?? c.montant} FCFA</p>
              </div>
              <div className="text-xs font-black bg-[#163A2C]/10 px-2.5 py-1 rounded-full">{c.items?.find((i:any)=> String(i.produit_id)===String(id))?.quantite || 1} x</div>
            </div>
          ))}
          {commandes.length===0 && <div className="p-8 text-center text-xs text-[#163A2C]/40">Aucune commande pour ce produit (chapelet, bible...)</div>}
        </div>
      </div>
    </div>
  );
}