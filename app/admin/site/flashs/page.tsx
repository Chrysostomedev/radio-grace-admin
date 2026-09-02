"use client";

import { useState, useEffect } from "react";
import { flashService, Flash } from "@/services/admin/flash.service";
import { Plus, Edit2, Trash2, AlertCircle, Loader } from "lucide-react";
import FlashModal from "@/components/modals/FlashModal";
import { toast } from "sonner";

export default function FlashsPage() {
  const [flashs, setFlashs] = useState<Flash[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlash, setSelectedFlash] = useState<Flash | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [type, setType] = useState("all");

  const loadFlashs = async () => {
    try {
      setLoading(true);
      const response = await flashService.getAll({ per_page: 100 });
      setFlashs(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Erreur chargement des flashs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashs();
  }, []);

  const handleCreate = () => {
    setSelectedFlash(null);
    setIsModalOpen(true);
  };

  const handleEdit = (flash: Flash) => {
    setSelectedFlash(flash);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce flash ?")) return;

    try {
      setDeleting(id);
      await flashService.delete(id);
      toast.success("Flash supprimé");
      await loadFlashs();
    } catch (error: any) {
      toast.error(error.message || "Erreur suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleModalClose = async (shouldRefresh: boolean) => {
    setIsModalOpen(false);
    setSelectedFlash(null);
    if (shouldRefresh) {
      await loadFlashs();
    }
  };

  const filteredFlashs = type === "all" 
    ? flashs 
    : flashs.filter(f => f.type === type);

  const getTypeIcon = (t?: string) => {
    switch (t) {
      case "URGENT":
        return "";
      case "IMPORTANT":
        return "";
      default:
        return "";
    }
  };

  const getTypeColor = (t?: string) => {
    switch (t) {
      case "URGENT":
        return "bg-red-100/50 text-red-600";
      case "IMPORTANT":
        return "bg-[#F0A93E]/20 text-[#9A6A1E]";
      default:
        return "bg-[#163A2C]/10 text-[#163A2C]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#163A2C]">Infos-Flash</h1>
          <p className="text-sm text-[#163A2C]/60 mt-1">Gérez les annonces et informations urgentes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-[#163A2C] text-white rounded-xl font-bold hover:bg-[#0E241C] transition shadow-lg"
        >
          <Plus size={18} />
          Nouveau flash
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Total</p>
          <p className="text-2xl font-black text-[#163A2C]">{flashs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Actifs</p>
          <p className="text-2xl font-black text-[#1E9D55]">{flashs.filter(f => f.is_active).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Urgents</p>
          <p className="text-2xl font-black text-red-600">{flashs.filter(f => f.type === "urgent").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Promos</p>
          <p className="text-2xl font-black text-[#F0A93E]">{flashs.filter(f => f.type === "promo").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "URGENT", "IMPORTANT", "NORMAL"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition flex items-center gap-2 ${
              type === t
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
      ) : filteredFlashs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#163A2C]/20">
          <p className="text-[#163A2C]/60 font-medium">Aucun flash {type !== "all" ? `de type ${type}` : ""}</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-[#163A2C] font-bold hover:underline"
          >
            Créer le premier →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFlashs.map((flash) => (
            <div
              key={flash.id}
              className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 hover:shadow-lg transition group flex items-start justify-between"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${getTypeColor(flash.type)}`}>
                  {getTypeIcon(flash.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-[#163A2C] line-clamp-2">
                      {flash.message}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      flash.is_active
                        ? "bg-[#1E9D55]/20 text-[#1E9D55]"
                        : "bg-[#163A2C]/20 text-[#163A2C]"
                    }`}>
                      {flash.is_active ? "✓ Actif" : "Inactif"}
                    </span>
                  </div>

                  <p className="text-sm text-[#163A2C]/60 line-clamp-2">
                    {flash.message}
                  </p>

                  {(flash.date_debut || flash.date_fin) && (
                    <div className="mt-2 text-xs text-[#163A2C]/50 flex gap-3">
                      {flash.date_debut && (
                        <span>📅 Du {new Date(flash.date_debut).toLocaleDateString("fr-FR")}</span>
                      )}
                      {flash.date_fin && (
                        <span>au {new Date(flash.date_fin).toLocaleDateString("fr-FR")}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => handleEdit(flash)}
                  className="p-2.5 rounded-lg bg-[#163A2C]/5 text-[#163A2C] hover:bg-[#163A2C]/10 transition"
                  title="Modifier"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => handleDelete(flash.id)}
                  disabled={deleting === flash.id}
                  className="p-2.5 rounded-lg bg-red-100/50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === flash.id ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <FlashModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        flash={selectedFlash}
      />
    </div>
  );
}
