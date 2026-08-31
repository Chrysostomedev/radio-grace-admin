// services/liveSessionService.ts
import axios from '@/core/axios';
import type { LiveSession, LiveSessionPayload } from '@/types/admin';

/** Réponse paginée de l'API Laravel */
interface LiveSessionsResponse {
    data: LiveSession[];
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
}

export interface LiveSessionsPaginated {
    data: LiveSession[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

/** Extrait le message d'erreur d'une réponse API, sinon fallback */
function getErrorMessage(err: unknown, fallback: string): string {
    const e = err as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message || fallback;
}

/** Assure que `response.data.data` existe, sinon renvoie `response.data` */
function unwrap<T>(res: { data?: { data?: T } | T }): T {
    const body = res.data;
    if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
        return body.data as T;
    }
    return body as T;
}

export const liveStreamService = {
    /** Créer une nouvelle session live */
    async create(data: LiveSessionPayload): Promise<LiveSession> {
        try {
            const res = await axios.post('/admin/live-sessions', {
                titre: data.titre,           // optionnel : dérivé du programme côté backend
                type: data.type,
                programme_id: data.programme_id,
            });
            return unwrap<LiveSession>(res);
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Erreur lors de la création de la session live'));
 }
    },

    /** Lister toutes les sessions live */
    async getAll(page = 1, perPage = 20): Promise<LiveSessionsPaginated> {
        try {
            const res = await axios.get<LiveSessionsResponse>('/admin/live-sessions', {
                params: { page, per_page: perPage },
            });
            const body = res.data ?? (res as unknown as LiveSessionsResponse);
            const list = Array.isArray(body.data) ? body.data : [];
            return {
                data: list,
                pagination: {
                    total: body.total ?? list.length,
                    per_page: body.per_page ?? perPage,
                    current_page: body.current_page ?? page,
                    last_page: body.last_page ?? 1,
                },
            };
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Erreur lors du chargement des sessions live'));
        }
    },

    /** Récupérer une session live par ID */
    async getById(id: number): Promise<LiveSession> {
        try {
            const res = await axios.get(`/admin/live-sessions/${id}`);
            return unwrap<LiveSession>(res);
        } catch (err) {
            throw new Error(getErrorMessage(err, `Session live ${id} introuvable`));
        }
    },

    /** Mettre à jour une session live */
    async update(id: number, data: Partial<LiveSessionPayload>): Promise<LiveSession> {
        try {
            const res = await axios.put(`/admin/live-sessions/${id}`, data);
            return unwrap<LiveSession>(res);
        } catch (err) {
            throw new Error(getErrorMessage(err, `Erreur lors de la mise à jour de la session ${id}`));
        }
    },

    /** Supprimer une session live */
    async delete(id: number): Promise<void> {
        try {
            await axios.delete(`/admin/live-sessions/${id}`);
        } catch (err) {
            throw new Error(getErrorMessage(err, `Erreur lors de la suppression de la session ${id}`));
        }
    },

    /** Forcer l'arrêt d'une session */
    async forceStop(id: number): Promise<LiveSession> {
        try {
            const res = await axios.post(`/admin/live-sessions/${id}/force-stop`);
            return unwrap<LiveSession>(res);
        } catch (err) {
            throw new Error(getErrorMessage(err, `Erreur lors de l'arrêt forcé de la session ${id}`));
        }
    },
};

/* ── Helpers purs (utilisables côté UI sans appel réseau) ── */

export const liveSessionHelpers = {
    isLive: (session: LiveSession | null): boolean => session?.is_live ?? false,
    isScheduled: (session: LiveSession | null): boolean => !(session?.is_live ?? false),
    getTypeLabel: (type: string): string =>
        ({ VIDEO: '📹 Vidéo', AUDIO: '🎙️ Audio' } as Record<string, string>)[type] ?? type,
};
