import { get, post, put, del } from "@/core/axios";

export interface Publicite {
  id: number;
  titre: string;
  description?: string;
  image?: string;
  lien_url?: string;
  position?: string;
  ordre?: number;
  actif?: boolean;
  date_debut?: string;
  date_fin?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  links: any;
  meta: any;
}

/**
 * Service pour gérer les publicités du site
 * GET    /admin/publicites                 - liste toutes les publicités
 * POST   /admin/publicites                 - crée une nouvelle publicité
 * PUT    /admin/publicites/{id}            - modifie une publicité
 * DELETE /admin/publicites/{id}            - supprime une publicité
 * POST   /admin/publicites/{id}/toggle     - active/désactive une publicité
 */
export const publiciteService = {
  /**
   * Récupère toutes les publicités avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<Publicite>> =>
    get(`/admin/publicites`, { params }),

  /**
   * Récupère une publicité spécifique
   */
  getOne: (id: number): Promise<ApiResponse<Publicite>> =>
    get(`/admin/publicites/${id}`),

  /**
   * Crée une nouvelle publicité
   */
  create: (payload: FormData): Promise<ApiResponse<Publicite>> =>
    post(`/admin/publicites`, payload),

  /**
   * Modifie une publicité existante
   */
  update: (id: number, payload: FormData): Promise<ApiResponse<Publicite>> =>
    put(`/admin/publicites/${id}`, payload),

  /**
   * Supprime une publicité
   */
  delete: (id: number): Promise<ApiResponse<null>> =>
    del(`/admin/publicites/${id}`),

  /**
   * Active/désactive une publicité
   */
  toggle: (id: number): Promise<ApiResponse<Publicite>> =>
    post(`/admin/publicites/${id}/toggle`, {}),
};
