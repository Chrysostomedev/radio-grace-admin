"use client";

import { useState, useEffect } from "react";
import { publiciteService, Publicite } from "@/services/admin/publicite.service";
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, Loader } from "lucide-react";
import PubliciteModal from "@/components/modals/PubliciteModal";
import { toast } from "sonner";

export default function PublicitesPage() {
  const [publicites, setPublicites] = useState<Publicite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPublicite, setSelectedPublicite] = useState<Publicite | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadPublicites = async () => {
    try {
      setLoading(true);
      const response = await publiciteService.getAll({ per_page: 50 });
      setPublicites(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Erreur chargement des publicités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicites();
  }, []);

  const handleCreate = () => {
    setSelectedPublicite(null);
    setIsModalOpen(true);
  };

  const handleEdit = (publicite: Publicite) => {
    setSelectedPublicite(publicite);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publicité ?")) return;

    try {
      setDeleting(id);
      await publiciteService.delete(id);
      toast.success("Publicité supprimée");
      await loadPublicites();
    } catch (error: any) {
      toast.error(error.message || "Erreur suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setTogglingId(id);
      await publiciteService.toggle(id);
      toast.success("Statut mis à jour");
      await loadPublicites();
    } catch (error: any) {
      toast.error(error.message || "Erreur activation");
    } finally {
      setTogglingId(null);
    }
  };

  const handleModalClose = async (shouldRefresh: boolean) => {
    setIsModalOpen(false);
    setSelectedPublicite(null);
    if (shouldRefresh) {
      await loadPublicites();
    }
  };

  const stats = {
    total: publicites.length,
    actives: publicites.filter(p => p.is_active).length,
    inactives: publicites.filter(p => !p.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#163A2C]">Publicités</h1>
          <p className="text-sm text-[#163A2C]/60 mt-1">Gérez les publicités et bannières du site</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-[#163A2C] text-white rounded-xl font-bold hover:bg-[#0E241C] transition shadow-lg"
        >
          <Plus size={18} />
          Nouvelle publicité
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Total</p>
          <p className="text-2xl font-black text-[#163A2C]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Actives</p>
          <p className="text-2xl font-black text-[#1E9D55]">{stats.actives}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Inactives</p>
          <p className="text-2xl font-black text-[#163A2C]/40">{stats.inactives}</p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl">
          <Loader className="w-8 h-8 animate-spin text-[#163A2C] mx-auto" />
          <p className="text-[#163A2C]/60 mt-3">Chargement...</p>
        </div>
      ) : publicites.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#163A2C]/20">
          <p className="text-[#163A2C]/60 font-medium">Aucune publicité créée</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-[#163A2C] font-bold hover:underline"
          >
            Créer la première →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicites.map((publicite) => (
            <div
              key={publicite.id}
              className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Image Preview */}
              <div className="relative h-40 bg-[#FBF6EA] overflow-hidden">
                {publicite.image ? (
                  <img
                    src={publicite.image}
                    alt={publicite.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#163A2C]/5">
                    <p className="text-[#163A2C]/40 text-sm">Pas d'image</p>
                  </div>
                )}

                {/* Active Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      publicite.is_active
                        ? "bg-[#1E9D55]/20 text-[#1E9D55]"
                        : "bg-[#163A2C]/20 text-[#163A2C]"
                    }`}
                  >
                    {publicite.is_active ? "✓ Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-[#163A2C] line-clamp-2">
                    {publicite.titre}
                  </h3>
                </div>

                {/* Meta info */}
                <div className="space-y-1 text-xs text-[#163A2C]/60">
                  {publicite.position && (
                    <div>📍 Position: <span className="font-bold">{publicite.position}</span></div>
                  )}
                  {publicite.clics !== undefined && (
                    <div>👆 Clics: <span className="font-bold">{publicite.clics}</span></div>
                  )}
                  {(publicite.date_debut || publicite.date_fin) && (
                    <div>
                      📅 {publicite.date_debut ? new Date(publicite.date_debut).toLocaleDateString("fr-FR") : "—"} 
                      {publicite.date_fin ? ` → ${new Date(publicite.date_fin).toLocaleDateString("fr-FR")}` : ""}
                    </div>
                  )}
                </div>

                {/* Video URL */}
                {publicite.video_url && (
                  <div className="bg-[#163A2C]/5 px-3 py-2 rounded-lg flex items-center justify-between gap-2">
                    <span className="text-xs text-[#163A2C]/70 truncate">
                      🎥 {publicite.video_url}
                    </span>
                    <a
                      href={publicite.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-[#163A2C]/10 rounded transition"
                      title="Ouvrir la vidéo"
                    >
                      <ExternalLink size={14} className="text-[#163A2C]" />
                    </a>
                  </div>
                )}

                {/* Link Preview */}
                {publicite.lien && (
                  <div className="bg-[#163A2C]/5 px-3 py-2 rounded-lg flex items-center justify-between gap-2">
                    <span className="text-xs text-[#163A2C]/70 truncate">
                      🔗 {publicite.lien}
                    </span>
                    <a
                      href={publicite.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-[#163A2C]/10 rounded transition"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink size={14} className="text-[#163A2C]" />
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[#163A2C]/5">
                  <button
                    onClick={() => handleToggle(publicite.id)}
                    disabled={togglingId === publicite.id}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                      publicite.is_active
                        ? "bg-[#1E9D55]/20 text-[#1E9D55] hover:bg-[#1E9D55]/30"
                        : "bg-[#163A2C]/10 text-[#163A2C]/70 hover:bg-[#163A2C]/20"
                    }`}
                    title={publicite.is_active ? "Désactiver" : "Activer"}
                  >
                    {togglingId === publicite.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : publicite.is_active ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(publicite)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#163A2C]/5 text-[#163A2C] font-bold text-sm transition hover:bg-[#163A2C]/10 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Modifier
                  </button>

                  <button
                    onClick={() => handleDelete(publicite.id)}
                    disabled={deleting === publicite.id}
                    className="py-2 px-3 rounded-lg bg-red-100/50 text-red-600 font-bold text-sm transition hover:bg-red-100 disabled:opacity-50 flex items-center justify-center"
                    title="Supprimer"
                  >
                    {deleting === publicite.id ? (
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
      <PubliciteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        publicite={selectedPublicite}
      />
    </div>
  );
}
