"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Upload, Loader2, Link2 } from "lucide-react";
import { Publicite } from "@/types/publicite.types";

interface PubliciteModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicite?: Publicite;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function PubliciteModal({
  isOpen,
  onClose,
  publicite,
  onSubmit,
  isLoading,
}: PubliciteModalProps) {
  const [titre, setTitre] = useState("");
  const [position, setPosition] = useState("BANNER");
  const [lien, setLien] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (publicite) {
      setTitre(publicite.titre);
      setPosition(publicite.position);
      setLien(publicite.lien || "");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';
      setImagePreview(publicite.image ? `${baseUrl}/storage/${publicite.image}` : null);
    } else {
      setTitre("");
      setPosition("BANNER");
      setLien("");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [publicite, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("position", position);
    if (lien) formData.append("lien", lien);
    if (imageFile) formData.append("image", imageFile);

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#0E241C]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#163A2C]/10 flex items-center justify-between bg-[#FBF6EA]/50">
          <h2 className="text-xl font-black text-[#163A2C]">
            {publicite ? "Modifier" : "Ajouter"} un élément
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl text-[#163A2C]/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Titre */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-1.5">Titre</label>
            <input
              type="text"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F0A93E] focus:border-transparent text-sm"
              placeholder="Ex: Partenaire principal, Promo de Noël..."
            />
          </div>

          {/* Type / Position */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-1.5">Emplacement</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F0A93E] text-sm font-medium"
            >
              <option value="BANNER">Bannière</option>
              <option value="PLAYER">Lecteur vidéo</option>
              <option value="INTERSTITIEL">Interstitiel</option>
              <option value="PARTENAIRE">Partenaire</option>
            </select>
          </div>

          {/* Lien */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-1.5 flex items-center gap-2">
              <Link2 size={16} className="text-[#163A2C]/50" />
              Lien web (Optionnel)
            </label>
            <input
              type="url"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F0A93E] focus:border-transparent text-sm"
              placeholder="https://example.com"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-1.5">Image / Logo</label>
            <div className="relative group rounded-2xl border-2 border-dashed border-[#163A2C]/20 hover:border-[#F0A93E] bg-[#FBF6EA]/30 transition-all overflow-hidden text-center">
              {imagePreview ? (
                <div className="relative w-full h-40">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-[#0E241C]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-[#163A2C] px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2">
                      <Upload size={16} /> Changer l'image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#163A2C]/5 flex items-center justify-center mb-3">
                    <ImageIcon size={24} className="text-[#163A2C]/40" />
                  </div>
                  <p className="text-sm font-bold text-[#163A2C]">Cliquez pour ajouter une image</p>
                  <p className="text-xs text-[#163A2C]/50 mt-1">PNG, JPG ou WebP (Max 2Mo)</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#FBF6EA] text-[#163A2C] text-sm font-bold rounded-xl border border-[#163A2C]/10 hover:bg-[#163A2C]/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-[#163A2C] text-[#F0A93E] text-sm font-bold rounded-xl hover:bg-[#0E241C] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
