"use client";
import { Clock, Truck, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { commandeService } from "@/services/admin/produit.service";

export default function CommandeSlider() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await commandeService.getAll({ per_page: 10 });
        const data = res.data.data || res.data || [];
        setCommandes(data.slice(0, 5)); // Limit to 5
      } catch (e) {
        console.error("Erreur chargement commandes", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusIcon = (statut: string) => {
    if (statut === "NEW") return <Clock size={12} />;
    if (statut === "PREPARATION") return <Truck size={12} />;
    if (statut === "LIVREE") return <Check size={12} />;
    return <Clock size={12} />;
  };

  const getStatusColor = (statut: string) => {
    if (statut === "NEW") return "bg-[#F0A93E] text-[#163A2C]";
    if (statut === "PREPARATION") return "bg-[#163A2C] text-white";
    if (statut === "LIVREE") return "bg-[#1E9D55] text-white";
    return "bg-[#163A2C]/50 text-white";
  };

  return (
    <div className="bg-white rounded- border border-[#163A2C]/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-[#163A2C] text-sm">Commandes reçues</h3>
        <span className="text- font-black px-2 py-1 rounded-full bg-[#F0A93E] text-[#163A2C] animate-pulse">LIVE • {commandes.length} nouvelles</span>
      </div>
      {loading ? (
        <div className="text-center text-sm text-[#163A2C]/40">Chargement...</div>
      ) : commandes.length === 0 ? (
        <div className="text-center text-sm text-[#163A2C]/40">Aucune commande</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {commandes.map(c=>(
            <div key={c.id} className="min-w- snap-start bg-[#FFFBF0] border border-[#163A2C]/10 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <p className="font-black text-[#163A2C] text-xs">{c.code}</p>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(c.statut)}`}>
                  {getStatusIcon(c.statut)}
                </span>
              </div>
              <p className="font-bold text-[#163A2C] text- mt-2">{c.client_nom}</p>
              <p className="text- text-[#163A2C]/60">{c.commandeItems?.[0]?.produit?.name || "Article"} • {c.montant_total} FCFA</p>
              <p className="text- text-[#163A2C]/40 mt-2">{new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}