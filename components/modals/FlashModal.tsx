"use client";

import { useState, useEffect } from "react";
import { flashService, Flash } from "@/services/admin/flash.service";
import { X, Loader } from "lucide-react";
import { toast } from "sonner";

interface FlashModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh: boolean) => void;
  flash: Flash | null;
}

export default function FlashModal({ isOpen, onClose, flash }: FlashModalProps) {
  const [formData, setFormData] = useState<Flash>({
    id: 0,
    message: "",
    type: "info",
    lien: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flash) {
      setFormData(flash);
    } else {
      setFormData({
        id: 0,
        message: "",
        type: "info",
        lien: "",
        is_active: true,
      });
    }
  }, [flash, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error("Le message est requis");
      return;
    }

    try {
      setLoading(true);

      if (flash?.id) {
        await flashService.update(flash.id, formData);
        toast.success("Flash mis à jour");
      } else {
        await flashService.create(formData);
        toast.success("Flash créé");
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
                {flash ? "Modifier le flash" : "Créer un flash"}
              </h2>
              <p className="text-sm text-[#163A2C]/60 mt-1">
                {flash ? "Modifiez l'info-flash" : "Ajoutez une nouvelle info-flash"}
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
                Type de flash
              </label>
              <select
                name="type"
                value={formData.type || "info"}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C] text-[#163A2C] font-bold"
              >
                <option value="info"> Info</option>
                <option value="urgent"> Urgent</option>
                <option value="promo">Promo</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message du flash"
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C] text-[#163A2C] placeholder-[#163A2C]/40 resize-none"
              />
              <p className="text-xs text-[#163A2C]/50 mt-1">{formData.message.length}/500</p>
            </div>

            {/* Lien */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Lien (optionnel)
              </label>
              <input
                type="url"
                name="lien"
                value={formData.lien || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C] text-[#163A2C] placeholder-[#163A2C]/40"
              />
            </div>

            {/* Date Début */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Date de début (optionnel)
              </label>
              <input
                type="datetime-local"
                name="date_debut"
                value={formData.date_debut ? formData.date_debut.slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C] text-[#163A2C]"
              />
            </div>

            {/* Date Fin */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">
                Date de fin (optionnel)
              </label>
              <input
                type="datetime-local"
                name="date_fin"
                value={formData.date_fin ? formData.date_fin.slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                className="w-full px-4 py-3 border border-[#163A2C]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163A2C] text-[#163A2C]"
              />
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
                Activer ce flash immédiatement
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
                ) : flash ? (
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
