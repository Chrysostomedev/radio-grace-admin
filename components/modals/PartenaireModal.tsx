"use client";

import { useState, useEffect } from "react";
import { partenaireService, Partenaire } from "@/services/admin/partenaire.service";
import { X, Loader, Upload } from "lucide-react";
import { toast } from "sonner";

interface PartenaireModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh: boolean) => void;
  partenaire: Partenaire | null;
}

export default function PartenaireModal({ isOpen, onClose, partenaire }: PartenaireModalProps) {
  const [formData, setFormData] = useState<any>({
    nom: "",
    description: "",
    type: "PARTENAIRE",
    site_url: "",
    email: "",
    telephone: "",
    adresse: "",
    ordre: 1,
    actif: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partenaire) {
      setFormData(partenaire);
      setLogoPreview(partenaire.logo || "");
    } else {
      setFormData({
        nom: "",
        description: "",
        type: "PARTENAIRE",
        site_url: "",
        email: "",
        telephone: "",
        adresse: "",
        ordre: 1,
        actif: true,
      });
      setLogoFile(null);
      setLogoPreview("");
    }
  }, [partenaire, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setLogoPreview(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error("Le nom du partenaire est requis");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("nom", formData.nom);
      payload.append("description", formData.description || "");
      payload.append("type", formData.type);
      payload.append("site_url", formData.site_url || "");
      payload.append("email", formData.email || "");
      payload.append("telephone", formData.telephone || "");
      payload.append("adresse", formData.adresse || "");
      payload.append("ordre", formData.ordre);
      payload.append("actif", formData.actif ? "1" : "0");

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (partenaire?.id) {
        await partenaireService.update(partenaire.id, payload);
        toast.success("Partenaire mis à jour");
      } else {
        await partenaireService.create(payload);
        toast.success("Partenaire créé");
      }

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
                {partenaire ? "Modifier le partenaire" : "Ajouter un partenaire"}
              </h2>
              <p className="text-sm text-[#163A2C]/60 mt-1">
                {partenaire ? "Modifiez les informations" : "Ajoutez un nouveau partenaire/sponsor"}
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
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Logo (optionnel)
              </label>
              <div className="border-2 border-dashed border-[#163A2C]/20 rounded-xl p-4">
                {logoPreview ? (
                  <div className="relative">
                    <div className="h-32 flex items-center justify-center bg-[#FBF6EA] rounded-lg">
                      <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview("");
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
                      Cliquez pour charger un logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Nom du partenaire *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
                maxLength={150}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Type de partenaire
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              >
                <option value="PARTENAIRE">Partenaire</option>
                <option value="SPONSEUR">Sponseur</option>
                <option value="DISTRIBUTEUR">Distributeur</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description du partenaire"
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C] resize-none"
              />
              <p className="text-xs text-[#163A2C]/50 mt-1">{formData.description.length}/500</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#163A2C] mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#163A2C] mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+225 XX XX XX XX"
                  className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
                />
              </div>
            </div>

            {/* Site URL */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Site web (optionnel)
              </label>
              <input
                type="url"
                name="site_url"
                value={formData.site_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C]"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Adresse (optionnel)
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Adresse complète"
                maxLength={200}
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
                Activer ce partenaire
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
                ) : partenaire ? (
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
