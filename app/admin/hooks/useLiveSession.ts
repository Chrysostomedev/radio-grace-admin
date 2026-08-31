// app/admin/hooks/useLiveSession.ts
import { useEffect, useState, useCallback } from 'react';
import { liveStreamService, liveSessionHelpers } from '@/services/liveSessionService';
import type { LiveSession, LiveSessionPayload } from '@/types/admin';
import { toast } from 'sonner';

interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface UseLiveSessionResult {
    sessions: LiveSession[];
    currentSession: LiveSession | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination;

    fetchSessions: (page?: number) => Promise<void>;
    fetchById: (id: number) => Promise<void>;
    createSession: (data: LiveSessionPayload) => Promise<LiveSession | null>;
    updateSession: (id: number, data: Partial<LiveSessionPayload>) => Promise<LiveSession | null>;
    deleteSession: (id: number) => Promise<boolean>;
    stopSession: (id: number) => Promise<boolean>;
    refreshSessions: () => Promise<void>;
}

const DEFAULT_PAGINATION: Pagination = {
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1,
};

/** Extrait un message lisible d'une erreur inconnue */
function toErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

/**
 * Hook de gestion des sessions live.
 * Les erreurs API sont remontées à l'UI via `error` + toast (aucun fallback silencieux).
 */
export function useLiveSession(): UseLiveSessionResult {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

    /** Référence à la page courante pour refresh sans closure périmée */
    const currentPageRef = useCallback((page: number) => {
        setPagination((prev) => ({ ...prev, current_page: page }));
    }, []);

    // ── Lister les sessions ──
    const fetchSessions = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const result = await liveStreamService.getAll(page, 20);
            setSessions(result.data);
            setPagination(result.pagination);
        } catch (err) {
            const message = toErrorMessage(err, 'Erreur lors de la récupération des sessions');
            setError(message);
            console.error('Erreur fetchSessions:', err);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Récupérer une session par ID ──
    const fetchById = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            setCurrentSession(await liveStreamService.getById(id));
        } catch (err) {
            const message = toErrorMessage(err, 'Erreur lors de la récupération de la session');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Créer ──
    const createSession = useCallback(
        async (data: LiveSessionPayload): Promise<LiveSession | null> => {
            try {
                setLoading(true);
                const session = await liveStreamService.create(data);
                toast.success('Session live créée avec succès');
                await fetchSessions();
                return session;
            } catch (err) {
                const message = toErrorMessage(err, 'Erreur lors de la création');
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchSessions]
    );

    // ── Mettre à jour ──
    const updateSession = useCallback(
        async (id: number, data: Partial<LiveSessionPayload>): Promise<LiveSession | null> => {
            try {
                setLoading(true);
                const session = await liveStreamService.update(id, data);
                toast.success('Session mise à jour');
                await fetchSessions();
                return session;
            } catch (err) {
                const message = toErrorMessage(err, 'Erreur lors de la mise à jour');
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchSessions]
    );

    // ── Supprimer ──
    const deleteSession = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                setLoading(true);
                await liveStreamService.delete(id);
                toast.success('Session supprimée');
                await fetchSessions();
                return true;
            } catch (err) {
                const message = toErrorMessage(err, 'Erreur lors de la suppression');
                setError(message);
                toast.error(message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchSessions]
    );

    // ── Arrêt forcé ──
    const stopSession = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                setLoading(true);
                await liveStreamService.forceStop(id);
                toast.success('Session arrêtée');
                await fetchSessions();
                return true;
            } catch (err) {
                const message = toErrorMessage(err, "Erreur lors de l'arrêt de la session");
                setError(message);
                toast.error(message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchSessions]
    );

    // ── Rafraîchir (recharge la page courante) ──
    const refreshSessions = useCallback(async () => {
        await fetchSessions(pagination.current_page);
    }, [fetchSessions, pagination.current_page]);

    // ── Chargement initial ──
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // ── Auto-refresh 10s tant qu'une session est en direct ──
    useEffect(() => {
        const hasLive = sessions.some(liveSessionHelpers.isLive);

        if (!hasLive) return;

        const interval = setInterval(() => {
            // Lit la page courante au moment du tick → pas de closure périmée
            fetchSessions(pagination.current_page);
        }, 10_000);

        return () => clearInterval(interval);
    }, [sessions, fetchSessions, pagination.current_page]);

    // Note : `currentPageRef` n'est pas nécessaire actuellement ;
    // voir remarque ci-dessous si tu veux simplifier davantage.
    void currentPageRef;

    return {
        sessions,
        currentSession,
        loading,
        error,
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
