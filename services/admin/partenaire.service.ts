import { get, post, put, del } from "@/core/axios";

export interface Partenaire {
  id: number;
  nom: string;
  description?: string;
  logo?: string;
  site_web?: string;
  type?: 'partenaire' | 'sponsor' | 'media';
  is_active?: boolean;
  ordre?: number;
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
 * Service pour gérer les partenaires du site
 * GET    /admin/partenaires                 - liste tous les partenaires
 * POST   /admin/partenaires                 - crée un nouveau partenaire
 * PUT    /admin/partenaires/{id}            - modifie un partenaire
 * DELETE /admin/partenaires/{id}            - supprime un partenaire
 * POST   /admin/partenaires/{id}/toggle     - active/désactive un partenaire
 */
export const partenaireService = {
  /**
   * Récupère tous les partenaires avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<Partenaire>> =>
    get(`/admin/partenaires`, { params }),

  /**
   * Récupère un partenaire spécifique
   */
  getOne: (id: number): Promise<ApiResponse<Partenaire>> =>
    get(`/admin/partenaires/${id}`),

  /**
   * Crée un nouveau partenaire
   */
  create: (payload: FormData): Promise<ApiResponse<Partenaire>> =>
    post(`/admin/partenaires`, payload),

  /**
   * Modifie un partenaire existant
   */
  update: (id: number, payload: FormData): Promise<ApiResponse<Partenaire>> =>
    put(`/admin/partenaires/${id}`, payload),

  /**
   * Supprime un partenaire
   */
  delete: (id: number): Promise<ApiResponse<null>> =>
    del(`/admin/partenaires/${id}`),

  /**
   * Active/désactive un partenaire
   */
  toggle: (id: number): Promise<ApiResponse<Partenaire>> =>
    post(`/admin/partenaires/${id}/toggle`, {}),
};
