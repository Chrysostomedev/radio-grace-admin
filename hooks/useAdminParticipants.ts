import { useState, useEffect } from "react";
import { adminEvenementsService, Participant } from "@/services/evenements.service";

export function useAdminParticipants(evenementId?: number) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async (id: number) => {
    if (!id || id === 0) {
      setParticipants([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminEvenementsService.getParticipants(id);
      // Ensure data is an array
      const data = Array.isArray(response.data) ? response.data : [];
      setParticipants(data);
    } catch (err: any) {
      console.error("Error fetching participants:", err);
      setError(err.message || "Erreur lors du chargement des participants");
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (evenementId) {
      fetchParticipants(evenementId);
    }
  }, [evenementId]);

  const refresh = () => {
    if (evenementId) {
      fetchParticipants(evenementId);
    }
  };

  return { participants: participants || [], loading, error, refresh };
}
