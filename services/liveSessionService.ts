// services/liveSessionService.ts
import axios from '@/core/axios';
import type { LiveSession, LiveSessionPayload } from '@/types/admin';

/**
 * Export du type pour utilisation
 */
export type { LiveSession };
export type CreateLiveSessionDTO = LiveSessionPayload;

/**
 * Données statiques de fallback au cas où le backend ne soit pas disponible
 */
const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 1,
    titre: 'Direct Louange Matinale',
    type: 'VIDEO',
    stream_url: 'http://192.168.1.81:8080/hls/stream_demo/index.m3u8',
    is_live: true,
    auditeurs_live: 1250,
    signal: 'OK',
    duree_en_cours_minutes: 15,
    programme: {
      id: 1,
      titre: 'Acclamez le Seigneur',
      slug: 'acclamez-le-seigneur',
      categorie: 'ACCLAMEZ',
      description: 'Chants de louange et d\'adoration',
      image: null,
      animateur: null,
      statut: 'ACTIF',
      en_direct: true,
      vues: 5420,
    },
    obs: {
      serveur: 'rtmp://192.168.1.81:1935/live',
      cle_de_flux: 'stream_demo_1691',
    },
  },
  {
    id: 2,
    titre: 'Prière du Soir',
    type: 'AUDIO',
    stream_url: null,
    is_live: false,
    auditeurs_live: 0,
    signal: 'OK',
    duree_en_cours_minutes: null,
    programme: {
      id: 2,
      titre: 'Prière Communautaire',
      slug: 'priere-communautaire',
      categorie: 'PRIERE',
      description: 'Temps de prière collective',
      image: null,
      animateur: null,
      statut: 'ACTIF',
      en_direct: false,
      vues: 3210,
    },
    obs: undefined,
  },
  {
    id: 3,
    titre: 'Bible et Réflexion',
    type: 'VIDEO',
    stream_url: null,
    is_live: false,
    auditeurs_live: 0,
    signal: 'OK',
    duree_en_cours_minutes: null,
    programme: null,
    obs: undefined,
  },
];

/**
 * Service pour gérer les sessions live
 * Avec fallback automatique si l'API n'est pas disponible
 */
export const liveStreamService = {
  /**
   * Créer une nouvelle session live
   */
  async create(data: LiveSessionPayload): Promise<LiveSession> {
    try {
      // Ne pas envoyer 'description' si elle n'existe pas dans la table
      const payload = {
        titre: data.titre,
        type: data.type,
        programme_id: data.programme_id,
        animateur_id: (data as any).animateur_id,
      };
      const response = await axios.post('/admin/live-sessions', payload);
      return response.data.data;
    } catch (error) {
      console.warn('API create failed, using mock:', error);
      // Fallback: créer une session mock
      const newMockSession: LiveSession = {
        id: Math.max(...MOCK_LIVE_SESSIONS.map((s) => s.id)) + 1,
        titre: data.titre,
        type: data.type,
        stream_url: `http://192.168.1.81:8080/hls/stream_${Date.now()}/index.m3u8`,
        is_live: false,
        auditeurs_live: 0,
        signal: 'OK',
        duree_en_cours_minutes: null,
        programme: null,
        obs: {
          serveur: 'rtmp://192.168.1.81:1935/live',
          cle_de_flux: `stream_${Date.now()}`,
        },
      };
      MOCK_LIVE_SESSIONS.push(newMockSession);
      return newMockSession;
    }
  },

  /**
   * Lister toutes les sessions live
   */
  async getAll(page: number = 1, perPage: number = 20): Promise<{
    data: LiveSession[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }> {
    try {
      const response = await axios.get('/admin/live-sessions', {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.warn('API getAll failed, using mock data:', error);
      // Fallback: retourner les mocks
      const start = (page - 1) * perPage;
      const paginatedData = MOCK_LIVE_SESSIONS.slice(start, start + perPage);

      return {
        data: paginatedData,
        pagination: {
          total: MOCK_LIVE_SESSIONS.length,
          per_page: perPage,
          current_page: page,
          last_page: Math.ceil(MOCK_LIVE_SESSIONS.length / perPage),
        },
      };
    }
  },

  /**
   * Récupérer une session live par ID
   */
  async getById(id: number): Promise<LiveSession> {
    try {
      const response = await axios.get(`/admin/live-sessions/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn(`API getById(${id}) failed, using mock:`, error);
      // Fallback: chercher dans les mocks
      const mockSession = MOCK_LIVE_SESSIONS.find((s) => s.id === id);
      if (mockSession) return mockSession;

      throw new Error(`Session ${id} not found`);
    }
  },

  /**
   * Mettre à jour une session live
   */
  async update(id: number, data: Partial<LiveSessionPayload>): Promise<LiveSession> {
    try {
      const response = await axios.put(`/admin/live-sessions/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn(`API update(${id}) failed, using mock:`, error);
      // Fallback: mettre à jour le mock
      const mockIndex = MOCK_LIVE_SESSIONS.findIndex((s) => s.id === id);
      if (mockIndex >= 0) {
        MOCK_LIVE_SESSIONS[mockIndex] = {
          ...MOCK_LIVE_SESSIONS[mockIndex],
          ...data,
        };
        return MOCK_LIVE_SESSIONS[mockIndex];
      }

      throw new Error(`Session ${id} not found`);
    }
  },

  /**
   * Supprimer une session live
   */
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`/admin/live-sessions/${id}`);
    } catch (error) {
      console.warn(`API delete(${id}) failed, using mock:`, error);
      // Fallback: supprimer du mock
      const mockIndex = MOCK_LIVE_SESSIONS.findIndex((s) => s.id === id);
      if (mockIndex >= 0) {
        MOCK_LIVE_SESSIONS.splice(mockIndex, 1);
      }
    }
  },

  /**
   * Forcer l'arrêt d'une session
   */
  async forceStop(id: number): Promise<LiveSession> {
    try {
      const response = await axios.post(`/admin/live-sessions/${id}/force-stop`);
      return response.data.data;
    } catch (error) {
      console.warn(`API forceStop(${id}) failed, using mock:`, error);
      // Fallback: mettre à jour le mock
      const mockIndex = MOCK_LIVE_SESSIONS.findIndex((s) => s.id === id);
      if (mockIndex >= 0) {
        MOCK_LIVE_SESSIONS[mockIndex].is_live = false;
        MOCK_LIVE_SESSIONS[mockIndex].auditeurs_live = 0;
        return MOCK_LIVE_SESSIONS[mockIndex];
      }

      throw new Error(`Session ${id} not found`);
    }
  },

  /**
   * Vérifier si une session est en direct
   */
  isLive(session: LiveSession | null): boolean {
    return session ? session.is_live : false;
  },

  /**
   * Vérifier si une session est planifiée
   */
  isScheduled(session: LiveSession | null): boolean {
    return session ? !session.is_live : false;
  },

  /**
   * Obtenir le label du type
   */
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      VIDEO: '📹 Vidéo',
      AUDIO: '🎙️ Audio',
    };
    return labels[type] || type;
  },

  /**
   * Obtenir les données de demo
   */
  getMockSessions(): LiveSession[] {
    return MOCK_LIVE_SESSIONS;
  },
};