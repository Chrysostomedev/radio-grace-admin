import { X, Users } from "lucide-react";
import { Participant } from "@/services/evenements.service";

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  participants: Participant[];
  isLoading?: boolean;
}

export default function ParticipantsModal({
  isOpen,
  onClose,
  eventTitle,
  participants,
  isLoading = false,
}: ParticipantsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F0A93E]/10">
              <Users size={20} className="text-[#F0A93E]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#163A2C]">Participants</h2>
              <p className="text-sm text-gray-500">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin">
                  <div className="h-8 w-8 border-4 border-[#F0A93E] border-t-transparent rounded-full" />
                </div>
                <p className="mt-4 text-sm text-gray-500">Chargement...</p>
              </div>
            </div>
          ) : !participants || participants.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Aucun participant</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(participants) && participants.map((participant, idx) => (
                <div
                  key={participant.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F0A93E]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#F0A93E]">
                      {(participant.nom_participant?.charAt(0) || "?").toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#163A2C]">
                      {participant.nom_participant || "Anonyme"}
                    </p>
                    {participant.email_participant && (
                      <p className="text-sm text-gray-500 truncate">
                        {participant.email_participant}
                      </p>
                    )}
                    {participant.telephone_participant && (
                      <p className="text-sm text-gray-500">
                        {participant.telephone_participant}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(participant.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {participant.statut === "CONFIRMEE" ? "✓ Confirmé" : participant.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 font-medium">
            Total: <span className="font-bold text-[#163A2C]">{participants.length}</span> participant{participants.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#163A2C] text-white font-semibold hover:bg-[#0F241A] transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
