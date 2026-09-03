"use client";

import { useState, useEffect } from "react";
import { heroSlideService, HeroSlide } from "@/services/admin/hero-slide.service";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader, Smartphone, Play, Pause, ChevronUp, ChevronDown } from "lucide-react";
import HeroSlideModal from "@/components/modals/HeroSlideModal";
import { toast } from "sonner";

export default function HeroMobilePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = await heroSlideService.getAll({ per_page: 50 });
      // Filter only for mobile display and sort by ordre
      // Accepte device_type === 'mobile' OU null (rétrocompatibilité)
      const mobileSlides = (response.data || [])
        .filter((slide: any) => slide.device_type === 'mobile' || slide.device_type === null)
        .sort((a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0));
      setSlides(mobileSlides);
    } catch (error: any) {
      toast.error(error.message || "Erreur chargement des bannieres mobiles");
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette bannière mobile ?")) return;

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

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    try {
      setUpdatingOrder(slides[index].id);
      const currentSlide = slides[index];
      const previousSlide = slides[index - 1];

      // Swap ordre values
      const newCurrentOrdre = (previousSlide.ordre ?? index - 1);
      const newPreviousOrdre = (currentSlide.ordre ?? index);

      // Update both slides
      const formData1 = new FormData();
      formData1.append('ordre', String(newCurrentOrdre));
      
      const formData2 = new FormData();
      formData2.append('ordre', String(newPreviousOrdre));

      await Promise.all([
        heroSlideService.update(currentSlide.id, formData1),
        heroSlideService.update(previousSlide.id, formData2),
      ]);

      toast.success("Ordre mis à jour");
      await loadSlides();
    } catch (error: any) {
      toast.error(error.message || "Erreur réorganisation");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;

    try {
      setUpdatingOrder(slides[index].id);
      const currentSlide = slides[index];
      const nextSlide = slides[index + 1];

      // Swap ordre values
      const newCurrentOrdre = (nextSlide.ordre ?? index + 1);
      const newNextOrdre = (currentSlide.ordre ?? index);

      // Update both slides
      const formData1 = new FormData();
      formData1.append('ordre', String(newCurrentOrdre));
      
      const formData2 = new FormData();
      formData2.append('ordre', String(newNextOrdre));

      await Promise.all([
        heroSlideService.update(currentSlide.id, formData1),
        heroSlideService.update(nextSlide.id, formData2),
      ]);

      toast.success("Ordre mis à jour");
      await loadSlides();
    } catch (error: any) {
      toast.error(error.message || "Erreur réorganisation");
    } finally {
      setUpdatingOrder(null);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#163A2C]/10 rounded-xl">
              <Smartphone size={24} className="text-[#163A2C]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#163A2C]">Bannieres Hero Mobile</h1>
              <p className="text-sm text-[#163A2C]/60 mt-1">Gérez le défilement vidéo/image avec texte pour mobile</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-3 bg-[#163A2C] text-white rounded-xl font-bold hover:bg-[#0E241C] transition shadow-lg"
        >
          <Plus size={18} />
          Nouvelle bannière
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Total</p>
          <p className="text-2xl font-black text-[#163A2C]">{slides.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Actives</p>
          <p className="text-2xl font-black text-[#1E9D55]">{slides.filter(s => s.actif).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Vidéos</p>
          <p className="text-2xl font-black text-[#F0A93E]">{slides.filter(s => s.type === "VIDEO").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#163A2C]/10 p-4 text-center">
          <p className="text-sm font-bold text-[#163A2C]/60">Images</p>
          <p className="text-2xl font-black text-[#CA8A04]">{slides.filter(s => s.type === "IMAGE").length}</p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl">
          <Loader className="w-8 h-8 animate-spin text-[#163A2C] mx-auto" />
          <p className="text-[#163A2C]/60 mt-3">Chargement...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#163A2C]/20">
          <p className="text-[#163A2C]/60 font-medium">Aucune bannière mobile créée</p>
          <p className="text-[#163A2C]/40 text-sm mt-1">Les bannières mobiles permettent un défilement immersif avec vidéo/image et texte</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-[#163A2C] font-bold hover:underline"
          >
            Créer la première →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden hover:shadow-lg transition group"
            >
              <div className="flex items-start gap-4 p-4">
                {/* Reorder Controls */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || updatingOrder === slide.id}
                    className="p-1.5 rounded bg-[#163A2C]/10 text-[#163A2C] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#163A2C]/20 transition"
                    title="Monter"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className="text-xs font-bold text-[#163A2C]/60 px-2 py-1 text-center">
                    {index + 1}/{slides.length}
                  </span>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === slides.length - 1 || updatingOrder === slide.id}
                    className="p-1.5 rounded bg-[#163A2C]/10 text-[#163A2C] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#163A2C]/20 transition"
                    title="Descendre"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Media Preview - Mobile Size */}
                <div className="relative w-24 h-40 bg-gradient-to-br from-[#FBF6EA] to-[#F0E5D3] rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-[#163A2C]/10">
                  {slide.type === "IMAGE" && slide.image ? (
                    <>
                      <img
                        src={slide.image}
                        alt={slide.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.querySelector('[data-fallback]')?.classList.remove('hidden');
                        }}
                      />
                      <div data-fallback className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FBF6EA] to-[#F0E5D3]">
                        <span className="text-lg mb-0.5">🖼️</span>
                        <p className="text-[#163A2C]/40 text-[10px] text-center px-1">Image</p>
                      </div>
                    </>
                  ) : slide.type === "IMAGE" ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-xl mb-1">⚠️</span>
                      <p className="text-[#CA8A04] text-[10px] text-center px-2 font-bold">Image requise</p>
                    </div>
                  ) : slide.type === "VIDEO" && slide.video ? (
                    <div
                      className="w-full h-full relative bg-gradient-to-br from-[#163A2C]/40 to-[#163A2C]/60 cursor-pointer group/video flex items-center justify-center"
                      onMouseEnter={() => setPlayingId(slide.id)}
                      onMouseLeave={() => setPlayingId(null)}
                    >
                      <div className="absolute inset-0 bg-[#163A2C]/40 group-hover/video:bg-[#163A2C]/60 transition" />
                      {playingId === slide.id ? (
                        <Pause size={24} className="text-white relative z-10" />
                      ) : (
                        <Play size={24} className="text-white relative z-10" />
                      )}
                      <p className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-bold truncate">
                        {slide.titre}
                      </p>
                    </div>
                  ) : slide.type === "VIDEO" ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-xl mb-1">⚠️</span>
                      <p className="text-[#CA8A04] text-[10px] text-center px-2 font-bold">Vidéo requise</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">📱</span>
                      <p className="text-[#163A2C]/40 text-xs">Pas media</p>
                    </div>
                  )}

                  {/* Active Badge */}
                  <div className="absolute top-1 right-1">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        slide.actif
                          ? "bg-[#1E9D55]/90 text-white"
                          : "bg-[#163A2C]/30 text-white"
                      }`}
                    >
                      {slide.actif ? "✓" : "○"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-black text-[#163A2C] line-clamp-2">
                        {slide.titre || "Sans titre"}
                      </h3>
                      {slide.sous_titre && (
                        <p className="text-sm text-[#163A2C]/60 line-clamp-1 mt-0.5">
                          {slide.sous_titre}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Type Badge & Metadata */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      slide.type === "VIDEO"
                        ? "bg-[#F0A93E]/20 text-[#9A6A1E]"
                        : "bg-[#163A2C]/10 text-[#163A2C]"
                    }`}>
                      {slide.type === "VIDEO" ? "🎬 Vidéo" : "🖼️ Image"}
                    </span>

                    <span className="text-xs font-bold text-[#163A2C]/60 px-2 py-1 bg-[#163A2C]/5 rounded">
                      Ordre: {slide.ordre || index}
                    </span>

                    {slide.lien && (
                      <span className="text-xs font-bold text-[#163A2C]/60 px-2 py-1 bg-[#163A2C]/5 rounded truncate">
                        🔗 {slide.lien}
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  {slide.type === "VIDEO" && (
                    <p className="text-xs text-[#163A2C]/50 mb-3">
                      ▶️ Défilement vidéo avec texte superposé sur mobile
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(slide.id)}
                    disabled={togglingId === slide.id}
                    className={`p-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center ${
                      slide.actif
                        ? "bg-[#1E9D55]/20 text-[#1E9D55] hover:bg-[#1E9D55]/30"
                        : "bg-[#163A2C]/10 text-[#163A2C]/70 hover:bg-[#163A2C]/20"
                    }`}
                    title={slide.actif ? "Désactiver" : "Activer"}
                  >
                    {togglingId === slide.id ? (
                      <Loader size={16} className="animate-spin" />
                    ) : slide.actif ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2.5 rounded-lg bg-[#163A2C]/5 text-[#163A2C] font-bold text-sm transition hover:bg-[#163A2C]/10 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(slide.id)}
                    disabled={deleting === slide.id}
                    className="p-2.5 rounded-lg bg-red-100/50 text-red-600 font-bold text-sm transition hover:bg-red-100 disabled:opacity-50 flex items-center justify-center"
                    title="Supprimer"
                  >
                    {deleting === slide.id ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
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
        deviceType="mobile"
      />
    </div>
  );
}
