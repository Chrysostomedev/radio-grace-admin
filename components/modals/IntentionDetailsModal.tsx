"use client";

import { X, Check, AlertCircle, Globe, Lock } from "lucide-react";
import { useState } from "react";

interface IntentionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  intention: any;
  onMarkAsPrie?: (id: number) => Promise<void>;
  onMarkAsClosed?: (id: number) => Promise<void>;
}

export default function IntentionDetailsModal({
  isOpen,
  onClose,
  intention,
  onMarkAsPrie,
  onMarkAsClosed,
}: IntentionDetailsModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !intention) return null;

  const handleMarkAsPrie = async () => {
    if (!onMarkAsPrie) return;
    setLoading(true);
    try {
      await onMarkAsPrie(intention.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsClosed = async () => {
    if (!onMarkAsClosed) return;
    setLoading(true);
    try {
      await onMarkAsClosed(intention.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "PRIE":
        return "#1E9D55";
      case "EN_ATTENTE":
        return "#F0A93E";
      case "CLOTURE":
        return "#163A2C";
      default:
        return "#6B7280";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "PRIE":
        return "Priée 🙏";
      case "EN_ATTENTE":
        return "En attente";
      case "CLOTURE":
        return "Clôturée";
      default:
        return statut;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[9999] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#163A2C]/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#163A2C]">Détails de l'intention</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#163A2C]/5 rounded-xl transition-colors"
          >
            <X size={24} className="text-[#163A2C]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* Statut Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#163A2C]/60 font-medium">Statut</span>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{
                backgroundColor: `${getStatutColor(intention.statut)}15`,
                borderColor: `${getStatutColor(intention.statut)}30`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatutColor(intention.statut) }}
              />
              <span
                className="font-bold text-sm uppercase tracking-wide"
                style={{ color: getStatutColor(intention.statut) }}
              >
                {getStatutLabel(intention.statut)}
              </span>
            </div>
          </div>

          {/* Intention Principale */}
          <div className="space-y-2">
            <label className="text-sm text-[#163A2C]/60 font-medium">Intention</label>
            <p className="text-lg font-bold text-[#163A2C] leading-relaxed">
              {intention.intention}
            </p>
          </div>

          {/* Description */}
          {intention.description && (
            <div className="space-y-2">
              <label className="text-sm text-[#163A2C]/60 font-medium">Description</label>
              <div className="p-4 bg-[#163A2C]/5 rounded-2xl border border-[#163A2C]/10">
                <p className="text-[#163A2C] leading-relaxed text-sm">
                  {intention.description}
                </p>
              </div>
            </div>
          )}

          {/* Informations Auditeur */}
          <div className="space-y-3">
            <label className="text-sm text-[#163A2C]/60 font-medium block">Informations</label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Nom */}
              <div className="p-4 bg-[#163A2C]/5 rounded-2xl border border-[#163A2C]/10">
                <p className="text-xs text-[#163A2C]/60 font-medium mb-2">Nom</p>
                <p className="text-[#163A2C] font-bold">
                  {intention.is_anonyme ? "Anonyme" : intention.nom || "—"}
                </p>
              </div>

              {/* Téléphone */}
              <div className="p-4 bg-[#163A2C]/5 rounded-2xl border border-[#163A2C]/10">
                <p className="text-xs text-[#163A2C]/60 font-medium mb-2">Téléphone</p>
                <p className="text-[#163A2C] font-bold">
                  {intention.is_anonyme ? "Caché" : intention.telephone || "—"}
                </p>
              </div>

              {/* Visibilité */}
              <div className="p-4 bg-[#163A2C]/5 rounded-2xl border border-[#163A2C]/10">
                <p className="text-xs text-[#163A2C]/60 font-medium mb-2 flex items-center gap-1">
                  {intention.is_public ? (
                    <>
                      <Globe size={12} /> Public
                    </>
                  ) : (
                    <>
                      <Lock size={12} /> Privé
                    </>
                  )}
                </p>
                <p className="text-[#163A2C] font-bold">
                  {intention.is_public ? "Visible à tous" : "Privée"}
                </p>
              </div>

              {/* Date de création */}
              <div className="p-4 bg-[#163A2C]/5 rounded-2xl border border-[#163A2C]/10">
                <p className="text-xs text-[#163A2C]/60 font-medium mb-2">Créée</p>
                <p className="text-[#163A2C] font-bold">{intention.created_human}</p>
              </div>
            </div>
          </div>

          {/* Auditeur Info */}
          {intention.auditeur && (
            <div className="space-y-3">
              <label className="text-sm text-[#163A2C]/60 font-medium block">Soumise par</label>
              <div className="p-4 bg-[#1E9D55]/10 rounded-2xl border border-[#1E9D55]/20">
                <div className="space-y-2">
                  <p className="text-sm text-[#163A2C]/60">Auditeur</p>
                  <p className="text-[#163A2C] font-bold">{intention.auditeur.user?.name || "N/A"}</p>
                  <p className="text-xs text-[#163A2C]/50 mt-2">
                    {intention.auditeur.user?.email}
                  </p>
                  {intention.auditeur.ville && (
                    <p className="text-xs text-[#163A2C]/50">
                      📍 {intention.auditeur.ville}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {(intention.statut !== "PRIE" || intention.statut !== "CLOTURE") && (
            <div className="flex gap-3 pt-6 border-t border-[#163A2C]/10">
              {intention.statut !== "PRIE" && (
                <button
                  onClick={handleMarkAsPrie}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1E9D55] text-white font-bold rounded-2xl hover:bg-[#1E9D55]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  Marquer comme priée
                </button>
              )}
              
              {intention.statut !== "CLOTURE" && (
                <button
                  onClick={handleMarkAsClosed}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#163A2C] text-white font-bold rounded-2xl hover:bg-[#163A2C]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertCircle size={18} />
                  Clôturer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
