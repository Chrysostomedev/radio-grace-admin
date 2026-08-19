"use client";

import { X, Eye, EyeOff, Calendar, Clock, Radio } from "lucide-react";

interface Animateur {
  id: number;
  nom_scene: string;
  bio?: string;
  photo?: string;
  facebook?: string;
  whatsapp?: string;
  is_visible: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Emission {
  id: number;
  titre: string;
  jour_emission: string;
  heure_debut: string;
  heure_fin: string;
  animateurs?: { id: number; nom_scene: string }[];
}

interface AnimateurDetailsPanelProps {
  animateur: Animateur;
  emissions: Emission[];
  onClose: () => void;
  onToggleVisibility: () => void;
}

const JOURS_EMISSION = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

export default function AnimateurDetailsPanel({
  animateur,
  emissions,
  onClose,
  onToggleVisibility,
}: AnimateurDetailsPanelProps) {
  const createdDate = new Date(animateur.created_at);
  const formattedDate = createdDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b border-[#163A2C]/10 bg-[#FFFBF0] px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0E241C]">{animateur.nom_scene}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#163A2C]/60 hover:bg-[#163A2C]/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Photo & Info */}
          <div className="flex gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#163A2C] to-[#0E241C] flex items-center justify-center overflow-hidden">
                {animateur.photo ? (
                  <img
                    src={animateur.photo}
                    alt={animateur.nom_scene}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Radio size={48} className="text-white/20" />
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-[#163A2C]/60 uppercase tracking-widest">
                  Nom de scène
                </p>
                <h3 className="text-lg font-bold text-[#0E241C]">
                  {animateur.nom_scene}
                </h3>
              </div>

              {animateur.user && (
                <>
                  <div>
                    <p className="text-xs text-[#163A2C]/60 uppercase tracking-widest">
                      Utilisateur
                    </p>
                    <p className="text-sm text-[#0E241C]">{animateur.user.name}</p>
                    <p className="text-xs text-[#163A2C]/60">{animateur.user.email}</p>
                  </div>
                </>
              )}

              <div>
                <p className="text-xs text-[#163A2C]/60 uppercase tracking-widest">
                  Créé le
                </p>
                <p className="text-sm text-[#0E241C]">{formattedDate}</p>
              </div>

              {/* Status */}
              <div className="pt-2">
                <button
                  onClick={onToggleVisibility}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    animateur.is_visible
                      ? "bg-[#1E9D55]/10 text-[#1E9D55] hover:bg-[#1E9D55]/20"
                      : "bg-[#163A2C]/10 text-[#163A2C] hover:bg-[#163A2C]/20"
                  }`}
                >
                  {animateur.is_visible ? (
                    <>
                      <Eye size={16} /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} /> Masqué
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          {animateur.bio && (
            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/10 p-4">
              <p className="text-xs text-[#163A2C]/60 uppercase tracking-widest mb-2">
                Bio
              </p>
              <p className="text-sm text-[#0E241C]">{animateur.bio}</p>
            </div>
          )}

          {/* Réseaux sociaux */}
          <div className="grid gap-4 grid-cols-2">
            {animateur.facebook && (
              <a
                href={animateur.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#F0A93E]/10 hover:bg-[#F0A93E]/20 border border-[#F0A93E]/20 p-4 transition-colors"
              >
                <p className="text-xs text-[#163A2C]/60 uppercase tracking-widest mb-1">
                  Facebook
                </p>
                <p className="text-sm text-[#F0A93E] font-semibold truncate">
                  {animateur.facebook}
                </p>
              </a>
            )}
            {animateur.whatsapp && (
              <a
                href={`https://wa.me/${animateur.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 p-4 transition-colors"
              >
                <p className="text-xs text-[#163A2C]/60 uppercase tracking-widest mb-1">
                  WhatsApp
                </p>
                <p className="text-sm text-[#25D366] font-semibold">{animateur.whatsapp}</p>
              </a>
            )}
          </div>

          {/* Émissions */}
          {emissions.length > 0 ? (
            <div>
              <h4 className="text-lg font-bold text-[#0E241C] mb-4">
                Émissions ({emissions.length})
              </h4>
              <div className="space-y-3">
                {emissions.map((emission) => (
                  <div
                    key={emission.id}
                    className="rounded-lg border border-[#163A2C]/10 p-4 hover:bg-[#FFFBF0] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-[#0E241C] mb-2">
                          {emission.titre}
                        </h5>
                        <div className="flex flex-wrap gap-4 text-sm text-[#163A2C]/60">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {JOURS_EMISSION[emission.jour_emission as keyof typeof JOURS_EMISSION] || emission.jour_emission}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {emission.heure_debut} - {emission.heure_fin}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/10 p-6 text-center">
              <p className="text-[#163A2C]/60">Aucune émission programmée</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#163A2C]/10 px-8 py-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-[#163A2C]/10 font-semibold text-[#0E241C] hover:bg-[#FFFBF0]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
