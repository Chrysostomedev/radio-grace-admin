"use client";

import { useState, useEffect } from "react";
import { heroSlideService, HeroSlide } from "@/services/admin/hero-slide.service";
import { X, Loader, Upload } from "lucide-react";
import { toast } from "sonner";

interface HeroSlideModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh: boolean) => void;
  slide: HeroSlide | null;
  deviceType?: 'site' | 'mobile';
}

export default function HeroSlideModal({ isOpen, onClose, slide, deviceType }: HeroSlideModalProps) {
  const [formData, setFormData] = useState<any>({
    titre: "",
    sous_titre: "",
    type: "IMAGE",
    lien: "",
    ordre: 1,
    actif: true,
    device_type: deviceType || null,
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slide) {
      setFormData(slide);
      setMediaPreview(slide.type === "IMAGE" ? (slide.image || "") : (slide.video || ""));
    } else {
      setFormData({
        titre: "",
        sous_titre: "",
        type: "IMAGE",
        lien: "",
        ordre: 1,
        actif: true,
      });
      setMediaFile(null);
      setMediaPreview("");
    }
  }, [slide, isOpen, deviceType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setMediaPreview(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("titre", formData.titre);
      payload.append("sous_titre", formData.sous_titre || "");
      payload.append("type", formData.type);
      payload.append("lien", formData.lien || "");
      payload.append("ordre", formData.ordre);
      payload.append("actif", formData.actif ? "1" : "0");
      
      // Always send device_type from the prop
      if (deviceType) {
        payload.append("device_type", deviceType);
      }

      if (mediaFile) {
        if (formData.type === "IMAGE") {
          payload.append("image", mediaFile);
        } else {
          payload.append("video", mediaFile);
        }
      }

      if (slide?.id) {
        await heroSlideService.update(slide.id, payload);
        toast.success("Bannière mise à jour");
      } else {
        await heroSlideService.create(payload);
        toast.success("Bannière créée");
      }

      onClose(true);
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isImageType = formData.type === "IMAGE";

  return (
    <>
      <div className="fixed inset-0 bg-[#0E241C]/60 backdrop-blur-sm z-[9998]" onClick={() => onClose(false)} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#163A2C]/10 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#163A2C]">
                {slide ? "Modifier la bannière" : "Créer une bannière"}
              </h2>
              <p className="text-sm text-[#163A2C]/60 mt-1">
                {slide ? "Modifiez les détails" : "Ajoutez une nouvelle bannière Hero"}
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-[#FBF6EA] rounded-lg text-[#163A2C]/50 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Type de média
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              >
                <option value="IMAGE">🖼️ Image</option>
                <option value="VIDEO">🎬 Vidéo</option>
              </select>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                {isImageType ? "Image" : "Vidéo"} (optionnel)
              </label>
              <div className="border-2 border-dashed border-[#163A2C]/20 rounded-xl p-4">
                {mediaPreview ? (
                  <div className="relative">
                    {isImageType ? (
                      <img src={mediaPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <video src={mediaPreview} className="w-full h-40 object-cover rounded-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMediaFile(null);
                        setMediaPreview("");
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-8">
                    <Upload className="w-8 h-8 text-[#163A2C]/40 mb-2" />
                    <span className="text-sm font-bold text-[#163A2C]/60">
                      Cliquez pour charger un {isImageType ? "image" : "vidéo"}
                    </span>
                    <input
                      type="file"
                      accept={isImageType ? "image/*" : "video/*"}
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Titre *
              </label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Titre principal"
                maxLength={150}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
              <p className="text-xs text-[#163A2C]/50 mt-1">{formData.titre.length}/150</p>
            </div>

            {/* Sous-titre */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Sous-titre (optionnel)
              </label>
              <input
                type="text"
                name="sous_titre"
                value={formData.sous_titre}
                onChange={handleChange}
                placeholder="Sous-titre"
                maxLength={150}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
              <p className="text-xs text-[#163A2C]/50 mt-1">{formData.sous_titre.length}/150</p>
            </div>

            {/* Lien */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                URL de lien (optionnel)
              </label>
              <input
                type="url"
                name="lien"
                value={formData.lien}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
            </div>

            {/* Ordre */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                name="ordre"
                value={formData.ordre}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3 p-4 bg-[#163A2C]/5 rounded-xl">
              <input
                type="checkbox"
                name="actif"
                checked={formData.actif || false}
                onChange={handleChange}
                id="actif"
                className="w-5 h-5 accent-[#163A2C]"
              />
              <label htmlFor="actif" className="font-bold text-[#163A2C] cursor-pointer">
                Activer cette bannière
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-[#163A2C]/10">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#163A2C]/5 text-[#163A2C] font-bold hover:bg-[#163A2C]/10 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#163A2C] text-white font-bold hover:bg-[#0E241C] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : slide ? (
                  "Mettre à jour"
                ) : (
                  "Créer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
