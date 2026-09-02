"use client";

import { useState, useEffect } from "react";
import { partenaireService, Partenaire } from "@/services/admin/partenaire.service";
import { Plus, Edit2, Trash2, Eye, EyeOff, Mail, Phone, Globe, Loader } from "lucide-react";
import PartenaireModal from "@/components/modals/PartenaireModal";
import { toast } from "sonner";

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartenaire, setSelectedPartenaire] = useState<Partenaire | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const loadPartenaires = async () => {
    try {
      setLoading(true);
      const response = await partenaireService.getAll({ per_page: 50 });
      setPartenaires(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Erreur chargement des partenaires");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartenaires();
  }, []);

  const handleCreate = () => {
    setSelectedPartenaire(null);
    setIsModalOpen(true);
  };

  const handleEdit = (partenaire: Partenaire) => {
    setSelectedPartenaire(partenaire);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) return;

    try {
      setDeleting(id);
      await partenaireService.delete(id);
      toast.success("Partenaire supprimé");
      await loadPartenaires();
    } catch (error: any) {
      toast.error(error.message || "Erreur suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setTogglingId(id);
      await partenaireService.toggle(id);
      toast.success("Statut mis à jour");
      await loadPartenaires();
    } catch (error: any) {
      toast.error(error.message || "Erreur activation");
    } finally {
      setTogglingId(null);
    }
  };

  const handleModalClose = async (shouldRefresh: boolean) => {
    setIsModalOpen(false);
    setSelectedPartenaire(null);
    if (shouldRefresh) {
      await loadPartenaires();
    }
  };

  const filteredPartenaires = typeFilter === "all" 
    ? partenaires 
    : partenaires.filter(p => p.type === typeFilter);

  const stats = {
    total: partenaires.length,
    actifs: partenaires.filter(p => p.is_active).length,
    inactifs: partenaires.filter(p => !p.is_active).length,
    sponseurs: partenaires.filter(p => p.type === "sponsor").length,
    partenaires: partenaires.filter(p => p.type === "partenaire").length,
  };

  const getTypeIcon = (t?: string) => {
    switch (t) {
      case "SPONSEUR":
        return "";
      case "DISTRIBUTEUR":
        return "";
      default:
        return "";
    }
  };

  const getTypeColor = (t?: string) => {
    switch (t) {
      case "SPONSEUR":
        return "bg-[#CA8A04]/20 text-[#9A6A1E]";
      case "DISTRIBUTEUR":
        return "bg-blue-100/50 text-blue-600";
      default:
        return "bg-[#163A2C]/10 text-[#163A2C]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#163A2C]">Partenaires</h1>
          <p className="text-sm text-[#163A2C]/60 mt-1">Gérez les partenaires et sponsors</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-[#163A2C] text-white rounded-xl font-bold hover:bg-[#0E241C] transition shadow-lg"
        >
          <Plus size={18} />
          Nouveau partenaire
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Total</p>
          <p className="text-2xl font-black text-[#163A2C]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Actifs</p>
          <p className="text-2xl font-black text-[#1E9D55]">{stats.actifs}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Inactifs</p>
          <p className="text-2xl font-black text-[#163A2C]/40">{stats.inactifs}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Sponseurs</p>
          <p className="text-2xl font-black text-[#CA8A04]">{stats.sponseurs}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Partenaires</p>
          <p className="text-2xl font-black text-blue-600">{stats.partenaires}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "SPONSEUR", "PARTENAIRE", "DISTRIBUTEUR"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition flex items-center gap-2 ${
              typeFilter === t
                ? "bg-[#163A2C] text-white"
                : "bg-[#163A2C]/5 text-[#163A2C] hover:bg-[#163A2C]/10"
            }`}
          >
            <span>{getTypeIcon(t === "all" ? undefined : t)}</span>
            {t === "all" ? "Tous" : t}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl">
          <Loader className="w-8 h-8 animate-spin text-[#163A2C] mx-auto" />
          <p className="text-[#163A2C]/60 mt-3">Chargement...</p>
        </div>
      ) : filteredPartenaires.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#163A2C]/20">
          <p className="text-[#163A2C]/60 font-medium">Aucun partenaire {typeFilter !== "all" ? `de type ${typeFilter}` : ""}</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-[#163A2C] font-bold hover:underline"
          >
            Ajouter le premier →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPartenaires.map((partenaire) => (
            <div
              key={partenaire.id}
              className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Logo Preview */}
              <div className="h-32 bg-[#FBF6EA] overflow-hidden flex items-center justify-center">
                {partenaire.logo ? (
                  <img
                    src={partenaire.logo}
                    alt={partenaire.nom}
                    className="max-w-full max-h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-[#163A2C]/40 text-center">
                    <div className="text-4xl mb-1">🏢</div>
                    <p className="text-xs">Pas de logo</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-black text-[#163A2C] line-clamp-2">
                      {partenaire.nom}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold mt-2 ${getTypeColor(partenaire.type)}`}>
                      {getTypeIcon(partenaire.type)} {partenaire.type || "PARTENAIRE"}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      partenaire.is_active
                        ? "bg-[#1E9D55]/20 text-[#1E9D55]"
                        : "bg-[#163A2C]/20 text-[#163A2C]"
                    }`}
                  >
                    {partenaire.is_active ? "✓ Actif" : "Inactif"}
                  </span>
                </div>

                {partenaire.description && (
                  <p className="text-sm text-[#163A2C]/60 line-clamp-2">
                    {partenaire.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-1 text-sm">
                  {partenaire.site_web && (
                    <div className="flex items-center gap-2 text-[#163A2C]/70">
                      <Globe size={14} className="shrink-0" />
                      <a href={partenaire.site_web} target="_blank" rel="noopener noreferrer" className="hover:text-[#163A2C] truncate text-[#163A2C]/80">
                        {partenaire.site_web}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[#163A2C]/5">
                  <button
                    onClick={() => handleToggle(partenaire.id)}
                    disabled={togglingId === partenaire.id}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                      partenaire.is_active
                        ? "bg-[#1E9D55]/20 text-[#1E9D55] hover:bg-[#1E9D55]/30"
                        : "bg-[#163A2C]/10 text-[#163A2C]/70 hover:bg-[#163A2C]/20"
                    }`}
                    title={partenaire.is_active ? "Désactiver" : "Activer"}
                  >
                    {togglingId === partenaire.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : partenaire.is_active ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(partenaire)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#163A2C]/5 text-[#163A2C] font-bold text-sm transition hover:bg-[#163A2C]/10 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Modifier
                  </button>

                  <button
                    onClick={() => handleDelete(partenaire.id)}
                    disabled={deleting === partenaire.id}
                    className="py-2 px-3 rounded-lg bg-red-100/50 text-red-600 font-bold text-sm transition hover:bg-red-100 disabled:opacity-50 flex items-center justify-center"
                    title="Supprimer"
                  >
                    {deleting === partenaire.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PartenaireModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        partenaire={selectedPartenaire}
      />
    </div>
  );
}
