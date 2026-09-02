import { get, post, put, del } from "@/core/axios";
import type { Podcast } from "@/types/admin";

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  links: any;
  meta: any;
}

interface CreatePodcastPayload {
  titre: string;
  description?: string;
  audio?: File;
  image?: File;
  programme_id?: number;
  animateur_id?: number;
  date_publication?: string;
  duree?: number;
  is_featured?: boolean;
}

interface UpdatePodcastPayload extends Partial<CreatePodcastPayload> {}

/**
 * Service pour gérer les podcasts
 * GET    /admin/podcasts                 - liste tous les podcasts
 * POST   /admin/podcasts                 - crée un nouveau podcast
 * PUT    /admin/podcasts/{id}            - modifie un podcast
 * DELETE /admin/podcasts/{id}            - supprime un podcast
 * POST   /admin/podcasts/{id}/publish    - publie un podcast
 * POST   /admin/podcasts/{id}/archive    - archive un podcast
 */
export const podcastService = {
  /**
   * Récupère tous les podcasts avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<Podcast>> =>
    get(`/admin/podcasts`, { params }),

  /**
   * Récupère un podcast spécifique
   */
  getOne: (id: number): Promise<ApiResponse<Podcast>> =>
    get(`/admin/podcasts/${id}`),

  /**
   * Crée un nouveau podcast
   */
  create: (payload: FormData): Promise<ApiResponse<Podcast>> =>
    post(`/admin/podcasts`, payload),

  /**
   * Modifie un podcast existant
   */
  update: (id: number, payload: FormData): Promise<ApiResponse<Podcast>> =>
    put(`/admin/podcasts/${id}`, payload),

  /**
   * Supprime un podcast
   */
  delete: (id: number): Promise<ApiResponse<null>> =>
    del(`/admin/podcasts/${id}`),

  /**
   * Publie un podcast
   */
  publish: (id: number): Promise<ApiResponse<Podcast>> =>
    post(`/admin/podcasts/${id}/publish`, {}),

  /**
   * Archive un podcast
   */
  archive: (id: number): Promise<ApiResponse<Podcast>> =>
    post(`/admin/podcasts/${id}/archive`, {}),
};
