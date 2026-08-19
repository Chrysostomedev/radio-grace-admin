// app/admin/hooks/useLiveSession.ts
import { useEffect, useState, useCallback } from 'react';
import { liveStreamService, type LiveSession } from '@/services/liveSessionService';
import type { LiveSessionPayload } from '@/types/admin';
import { toast } from 'sonner';

interface UseLiveSessionResult {
  sessions: LiveSession[];
  currentSession: LiveSession | null;
  loading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };

  // Actions
  fetchSessions: (page?: number) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createSession: (data: LiveSessionPayload) => Promise<LiveSession | null>;
  updateSession: (id: number, data: Partial<LiveSessionPayload>) => Promise<LiveSession | null>;
  deleteSession: (id: number) => Promise<boolean>;
  stopSession: (id: number) => Promise<boolean>;
  refreshSessions: () => Promise<void>;
}

/**
 * Hook pour gérer les sessions live
 * Utilise les données mock en fallback si l'API n'est pas disponible
 */
export function useLiveSession(): UseLiveSessionResult {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1,
  });

  // Récupérer toutes les sessions
  const fetchSessions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await liveStreamService.getAll(page, 20);
      setSessions(result.data);
      setPagination(result.pagination);

      // Vérifier si on utilise des données mock
      if (result.data.length > 0 && result.data[0].id === 1) {
        setIsUsingMockData(true);
        console.log('ℹ️ Utilisation des données de démo (Docker non lancé)');
        toast.info('Utilisation de données de démo');
      } else {
        setIsUsingMockData(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(message);
      console.error('Erreur fetchSessions:', err);
      setIsUsingMockData(true);
      toast.warning('Données de démo utilisées (API indisponible)');
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer une session par ID
  const fetchById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const session = await liveStreamService.getById(id);
      setCurrentSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une session
  const createSession = useCallback(async (data: LiveSessionPayload): Promise<LiveSession | null> => {
    try {
      setLoading(true);
      const session = await liveStreamService.create(data);
      toast.success('Session live créée avec succès');
      await fetchSessions();
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchSessions]);

  // Mettre à jour une session
  const updateSession = useCallback(
    async (id: number, data: Partial<LiveSessionPayload>): Promise<LiveSession | null> => {
      try {
        setLoading(true);
        const session = await liveStreamService.update(id, data);
        toast.success('Session mise à jour');
        await fetchSessions();
        return session;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchSessions]
  );

  // Supprimer une session
  const deleteSession = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await liveStreamService.delete(id);
      toast.success('Session supprimée');
      await fetchSessions();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSessions]);

  // Arrêter une session
  const stopSession = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await liveStreamService.forceStop(id);
      toast.success('Session arrêtée');
      await fetchSessions();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'arrêt';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSessions]);

  // Rafraîchir les sessions
  const refreshSessions = useCallback(async () => {
    await fetchSessions(pagination.current_page);
  }, [fetchSessions, pagination.current_page]);

  // Charger les sessions au montage
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-refresh toutes les 10 secondes si une session est en direct
  useEffect(() => {
    const hasLive = sessions.some((s) => liveStreamService.isLive(s));

    if (hasLive) {
      const interval = setInterval(refreshSessions, 10000);
      return () => clearInterval(interval);
    }
  }, [sessions, refreshSessions]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    isUsingMockData,
    pagination,
    fetchSessions,
    fetchById,
    createSession,
    updateSession,
    deleteSession,
    stopSession,
    refreshSessions,
  };
}
