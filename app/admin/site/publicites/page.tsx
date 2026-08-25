"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Search, SearchX, Image as ImageIcon, Link2,
  Trash2, Edit, CheckCircle2, XCircle, MousePointerClick
} from "lucide-react";
import {
  usePublicites,
  useCreatePublicite,
  useUpdatePublicite,
  useDeletePublicite
} from "@/hooks/usePublicites";
import { PubliciteModal } from "@/components/modals/PubliciteModal";
import { Publicite } from "@/types/publicite.types";

const POSITIONS = ["PLAYER", "BANNER", "INTERSTITIEL", "PARTENAIRE"] as const;

const POSITION_LABELS: Record<string, string> = {
  PLAYER: "Lecteur vidéo",
  BANNER: "Bannière",
  INTERSTITIEL: "Interstitiel",
  PARTENAIRE: "Partenaire",
};

function PublicitesContent() {
  const searchParams = useSearchParams();
  const positionFilter = searchParams.get("position");

  const { data, isLoading } = usePublicites(positionFilter ?? undefined);
  const { mutate: createPublicite, isPending: isCreating } = useCreatePublicite();
  const { mutate: updatePublicite, isPending: isUpdating } = useUpdatePublicite();
  const { mutate: deletePublicite } = useDeletePublicite();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublicite, setEditingPublicite] = useState<Publicite | undefined>(undefined);

  const publicites = data?.data || [];

  const filteredPublicites = useMemo(() => {
    return publicites.filter((pub) => {
      const matchSearch = pub.titre.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [publicites, searchQuery]);

  const handleOpenModal = (publicite?: Publicite) => {
    setEditingPublicite(publicite);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPublicite(undefined);
  };

  const handleSubmit = (formData: FormData) => {
    if (editingPublicite) {
      updatePublicite(
        { id: editingPublicite.id, data: formData },
        { onSuccess: handleCloseModal }
      );
    } else {
      createPublicite(formData, { onSuccess: handleCloseModal });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet élément ?")) {
      deletePublicite(id);
    }
  };

  const pageTitle = positionFilter
    ? `Publicités — ${POSITION_LABELS[positionFilter] ?? positionFilter}`
    : "Partenaires & Publicités";

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#163A2C] tracking-tight">
            Gestion des {pageTitle}
          </h1>
          <p className="text-sm text-[#163A2C]/60 mt-1 font-medium">
            Gérez les encarts publicitaires et les logos des partenaires affichés sur le site.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#163A2C] text-[#F0A93E] px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#163A2C]/5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#163A2C]/40" size={20} />
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FBF6EA]/50 border border-[#163A2C]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F0A93E] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-3xl border border-[#163A2C]/5 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-[#163A2C]/40">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold">Chargement...</span>
          </div>
        </div>
      ) : filteredPublicites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-[#163A2C]/5 border-dashed shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#FBF6EA] flex items-center justify-center mb-4">
            <SearchX className="text-[#163A2C]/40" size={32} />
          </div>
          <h3 className="text-lg font-black text-[#163A2C]">Aucun résultat trouvé</h3>
          <p className="text-sm text-[#163A2C]/50 mt-1 max-w-sm">
            {searchQuery
              ? `Aucun élément ne correspond à "${searchQuery}".`
              : "Commencez par ajouter un nouveau partenaire ou une publicité."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublicites.map((pub) => (
            <div key={pub.id} className="bg-white rounded-3xl overflow-hidden border border-[#163A2C]/5 shadow-sm hover:shadow-md hover:border-[#F0A93E]/30 transition-all group flex flex-col">
              <div className="relative h-48 bg-[#FBF6EA] flex items-center justify-center overflow-hidden">
                {pub.image ? (
                  <img
                    src={pub.image}
                    alt={pub.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImageIcon size={48} className="text-[#163A2C]/20" />
                )}

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg bg-[#163A2C] text-[#F0A93E]">
                    {POSITION_LABELS[pub.position] ?? pub.position}
                  </span>
                </div>

                <div className="absolute inset-0 bg-[#0E241C]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleOpenModal(pub)}
                    className="w-10 h-10 rounded-full bg-white text-[#163A2C] flex items-center justify-center hover:bg-[#F0A93E] hover:scale-110 transition-all shadow-lg"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(pub.id)}
                    className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all shadow-lg"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-[#163A2C] text-lg mb-1 truncate" title={pub.titre}>
                  {pub.titre}
                </h3>

                <div className="mt-auto space-y-3 pt-4 border-t border-[#163A2C]/5">
                  {pub.lien && (
                    <a
                      href={pub.lien}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate"
                    >
                      <Link2 size={14} className="shrink-0" />
                      {pub.lien}
                    </a>
                  )}

                  <div className="flex items-center justify-between text-xs font-medium text-[#163A2C]/50 bg-[#FBF6EA] px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick size={14} className="text-[#F0A93E]" />
                      {pub.clics} clic{pub.clics !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pub.is_active !== false ? (
                        <><CheckCircle2 size={14} className="text-green-500" /> Actif</>
                      ) : (
                        <><XCircle size={14} className="text-red-500" /> Inactif</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PubliciteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        publicite={editingPublicite}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

export default function PublicitesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#163A2C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PublicitesContent />
    </Suspense>
  );
}