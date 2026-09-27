"use client";

import { useState, useEffect } from "react";
import { publiciteService, Publicite } from "@/services/admin/publicite.service";
import { X, Loader, Upload } from "lucide-react";
import { toast } from "sonner";

interface PubliciteModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh: boolean) => void;
  publicite: Publicite | null;
}

export default function PubliciteModal({ isOpen, onClose, publicite }: PubliciteModalProps) {
  const [formData, setFormData] = useState<any>({
    titre: "",
    video_url: "",
    lien: "",
    position: "PLAYER",
    is_active: true,
    date_debut: "",
    date_fin: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicite) {
      // Normaliser position: si elle n'est pas valide, mettre PLAYER par défaut
      const validPositions = ["PLAYER", "BANNER", "INTERSTITIEL", "PARTENAIRE"];
      const position = validPositions.includes(publicite.position || "") 
        ? publicite.position 
        : "PLAYER";
      
      setFormData({
        titre: publicite.titre || "",
        video_url: publicite.video_url || "",
        lien: publicite.lien || "",
        position,
        is_active: publicite.is_active !== undefined ? publicite.is_active : true,
        date_debut: publicite.date_debut || "",
        date_fin: publicite.date_fin || "",
      });
      setImagePreview(publicite.image || "");
    } else {
      setFormData({
        titre: "",
        video_url: "",
        lien: "",
        position: "PLAYER",
        is_active: true,
        date_debut: "",
        date_fin: "",
      });
      setImageFile(null);
      setImagePreview("");
    }
  }, [publicite, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImagePreview(evt.target?.result as string);
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

      // Stratégie : si on modifie avec image, utiliser FormData
      // Sinon, utiliser JSON (plus simple)
      const isUpdating = !!publicite?.id;
      const hasImageChange = !!imageFile;

      if (hasImageChange) {
        // Avec fichier image : FormData
        const payload = new FormData();
        payload.append("titre", formData.titre);
        payload.append("video_url", formData.video_url || "");
        payload.append("lien", formData.lien || "");
        payload.append("position", formData.position);
        payload.append("is_active", formData.is_active ? "1" : "0");
        payload.append("date_debut", formData.date_debut || "");
        payload.append("date_fin", formData.date_fin || "");
        payload.append("image", imageFile);

        if (isUpdating) {
          payload.append("_method", "PUT");
          await publiciteService.update(publicite.id, payload);
        } else {
          await publiciteService.create(payload);
        }
      } else {
        // Sans fichier : JSON
        const payload = {
          titre: formData.titre,
          video_url: formData.video_url || null,
          lien: formData.lien || null,
          position: formData.position,
          is_active: formData.is_active,
          date_debut: formData.date_debut || null,
          date_fin: formData.date_fin || null,
        };

        if (isUpdating) {
          await publiciteService.update(publicite.id, payload);
        } else {
          await publiciteService.create(payload);
        }
      }

      toast.success(isUpdating ? "Publicité mise à jour" : "Publicité créée");
      onClose(true);
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[#0E241C]/60 backdrop-blur-sm z-[9998]" onClick={() => onClose(false)} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#163A2C]/10 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#163A2C]">
                {publicite ? "Modifier la publicité" : "Créer une publicité"}
              </h2>
              <p className="text-sm text-[#163A2C]/60 mt-1">
                {publicite ? "Modifiez les détails" : "Ajoutez une nouvelle publicité"}
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
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Image (optionnel)
              </label>
              <div className="border-2 border-dashed border-[#163A2C]/20 rounded-xl p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
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
                      Cliquez pour charger une image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
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
                placeholder="Titre de la publicité"
                maxLength={150}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
              <p className="text-xs text-[#163A2C]/50 mt-1">{formData.titre.length}/150</p>
            </div>

            {/* Description → Video URL */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Lien Vidéo (optionnel)
              </label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
            </div>

            {/* URL Lien → Lien */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                URL de destination (optionnel)
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

            {/* Position */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              >
                <option value="PLAYER">Lecteur</option>
                <option value="BANNER">Bannière</option>
                <option value="INTERSTITIEL">Interstitiel</option>
                <option value="PARTENAIRE">Partenaire</option>
              </select>
            </div>

            {/* Ordre removed - not in DB */}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#163A2C] mb-2">
                  Début (optionnel)
                </label>
                <input
                  type="datetime-local"
                  name="date_debut"
                  value={formData.date_debut ? formData.date_debut.slice(0, 16) : ""}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#163A2C] mb-2">
                  Fin (optionnel)
                </label>
                <input
                  type="datetime-local"
                  name="date_fin"
                  value={formData.date_fin ? formData.date_fin.slice(0, 16) : ""}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
                />
              </div>
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3 p-4 bg-[#163A2C]/5 rounded-xl">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleChange}
                id="is_active"
                className="w-5 h-5 accent-[#163A2C]"
              />
              <label htmlFor="is_active" className="font-bold text-[#163A2C] cursor-pointer">
                Activer cette publicité
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
                ) : publicite ? (
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
