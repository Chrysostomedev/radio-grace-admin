"use client";

import { useState, useEffect } from "react";
import { heroSlideService, HeroSlide } from "@/services/admin/hero-slide.service";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader, Smartphone, Monitor } from "lucide-react";
import HeroSlideModal from "@/components/modals/HeroSlideModal";
import { toast } from "sonner";
import Link from "next/link";

export default function HeroSlidesMobilePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = await heroSlideService.getAll({ per_page: 50 });
      // Filter only for mobile display (where device_type is 'mobile')
      const mobileSlides = (response.data || []).filter((slide: any) => slide.device_type === 'mobile');
      setSlides(mobileSlides);
    } catch (error: any) {
      toast.error(error.message || "Erreur chargement des bannieres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleCreate = () => {
    setSelectedSlide(null);
    setIsModalOpen(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette bannière ?")) return;

    try {
      setDeleting(id);
      await heroSlideService.delete(id);
      toast.success("Bannière supprimée");
      await loadSlides();
    } catch (error: any) {
      toast.error(error.message || "Erreur suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setTogglingId(id);
      await heroSlideService.toggle(id);
      toast.success("Statut mis à jour");
      await loadSlides();
    } catch (error: any) {
      toast.error(error.message || "Erreur activation");
    } finally {
      setTogglingId(null);
    }
  };

  const handleModalClose = async (shouldRefresh: boolean) => {
    setIsModalOpen(false);
    setSelectedSlide(null);
    if (shouldRefresh) {
      await loadSlides();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex gap-0 border-b border-[#163A2C]/10">
        <Link
          href="/admin/site/hero-slides/site"
          className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-[#163A2C]/60 font-bold hover:text-[#163A2C] transition"
        >
          <Monitor size={18} />
          Site Web
        </Link>
        <Link
          href="/admin/site/hero-slides/mobile"
          className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#163A2C] text-[#163A2C] font-bold"
        >
          <Smartphone size={18} />
          Mobile
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#163A2C]">Bannieres Hero - Mobile</h1>
          <p className="text-sm text-[#163A2C]/60 mt-1">Gérez les bannieres du carrousel principal pour le mobile (vidéo + texte défilant)</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-[#163A2C] text-white rounded-xl font-bold hover:bg-[#0E241C] transition shadow-lg"
        >
          <Plus size={18} />
          Nouvelle bannière
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl">
          <Loader className="w-8 h-8 animate-spin text-[#163A2C] mx-auto" />
          <p className="text-[#163A2C]/60 mt-3">Chargement...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#163A2C]/20">
          <p className="text-[#163A2C]/60 font-medium">Aucune bannière créée pour mobile</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-[#163A2C] font-bold hover:underline"
          >
            Créer la première →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Image Preview */}
              <div className="relative h-40 bg-[#FBF6EA] overflow-hidden">
                {slide.type === "IMAGE" && slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.titre}
                    className="w-full h-full object-cover"
                  />
                ) : slide.type === "VIDEO" && slide.video ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#163A2C]/10">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎬</div>
                      <p className="text-xs text-[#163A2C]/60">Vidéo</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#163A2C]/5">
                    <p className="text-[#163A2C]/40 text-sm">Pas d'image</p>
                  </div>
                )}

                {/* Active Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      slide.actif
                        ? "bg-[#1E9D55]/20 text-[#1E9D55]"
                        : "bg-[#163A2C]/20 text-[#163A2C]"
                    }`}
                  >
                    {slide.actif ? "✓ Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-[#163A2C] line-clamp-2">
                    {slide.titre || "Sans titre"}
                  </h3>
                  {slide.sous_titre && (
                    <p className="text-sm text-[#163A2C]/60 line-clamp-1 mt-1">
                      {slide.sous_titre}
                    </p>
                  )}
                </div>

                {slide.lien && (
                  <div className="text-xs bg-[#FBF6EA] px-2 py-1 rounded text-[#163A2C]/70 truncate">
                    🔗 {slide.lien}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-[#163A2C]/60 px-2 py-1 bg-[#163A2C]/5 rounded">
                    Ordre: {slide.ordre || "-"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[#163A2C]/5">
                  <button
                    onClick={() => handleToggle(slide.id)}
                    disabled={togglingId === slide.id}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                      slide.actif
                        ? "bg-[#1E9D55]/20 text-[#1E9D55] hover:bg-[#1E9D55]/30"
                        : "bg-[#163A2C]/10 text-[#163A2C]/70 hover:bg-[#163A2C]/20"
                    }`}
                    title={slide.actif ? "Désactiver" : "Activer"}
                  >
                    {togglingId === slide.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : slide.actif ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#163A2C]/5 text-[#163A2C] font-bold text-sm transition hover:bg-[#163A2C]/10 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Modifier
                  </button>

                  <button
                    onClick={() => handleDelete(slide.id)}
                    disabled={deleting === slide.id}
                    className="py-2 px-3 rounded-lg bg-red-100/50 text-red-600 font-bold text-sm transition hover:bg-red-100 disabled:opacity-50 flex items-center justify-center"
                    title="Supprimer"
                  >
                    {deleting === slide.id ? (
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
      <HeroSlideModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        slide={selectedSlide}
      />
    </div>
  );
}
