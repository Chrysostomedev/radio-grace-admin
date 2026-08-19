"use client";
import { Clock, Check, Truck, X } from "lucide-react";

const COMMANDES = [
  { id: "RGE-1023", client: "Marie K.", produit: "Livre Père Attobra", montant: "12 000 FCFA", status: "new", time: "Il y a 5 min" },
  { id: "RGE-1022", client: "Paul A.", produit: "T-shirt RGE 102.3", montant: "8 500 FCFA", status: "preparation", time: "Il y a 1h" },
  { id: "RGE-1021", client: "Grâce E.", produit: "Chapelet + Livre", montant: "20 000 FCFA", status: "livraison", time: "Il y a 3h" },
];

export default function CommandeSlider() {
  return (
    <div className="bg-white rounded- border border-[#163A2C]/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-[#163A2C] text-sm">Commandes reçues</h3>
        <span className="text- font-black px-2 py-1 rounded-full bg-[#F0A93E] text-[#163A2C] animate-pulse">LIVE • 3 nouvelles</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
        {COMMANDES.map(c=>(
          <div key={c.id} className="min-w- snap-start bg-[#FFFBF0] border border-[#163A2C]/10 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <p className="font-black text-[#163A2C] text-xs">{c.id}</p>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${c.status==="new"? "bg-[#F0A93E] text-[#163A2C]" : c.status==="preparation"? "bg-[#163A2C] text-white" : "bg-[#1E9D55] text-white"}`}>
                {c.status==="new"? <Clock size={12}/> : c.status==="preparation"? <Truck size={12}/> : <Check size={12}/>}
              </span>
            </div>
            <p className="font-bold text-[#163A2C] text- mt-2">{c.produit}</p>
            <p className="text- text-[#163A2C]/60">{c.client} • {c.montant}</p>
            <p className="text- text-[#163A2C]/40 mt-2">{c.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}