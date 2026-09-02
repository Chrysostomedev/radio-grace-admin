import { get, post, put, del } from "@/core/axios";

export interface Flash {
  id: number;
  message: string;
  type?: 'info' | 'urgent' | 'promo';
  lien?: string;
  is_active?: boolean;
  ordre?: number;
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
 * Service pour gérer les infos-flash du site
 * GET    /admin/flashs                 - liste tous les flashs
 * POST   /admin/flashs                 - crée un nouveau flash
 * PUT    /admin/flashs/{id}            - modifie un flash
 * DELETE /admin/flashs/{id}            - supprime un flash
 */
export const flashService = {
  /**
   * Récupère tous les flashs avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<Flash>> =>
    get(`/admin/flashs`, { params }),

  /**
   * Récupère un flash spécifique
   */
  getOne: (id: number): Promise<ApiResponse<Flash>> =>
    get(`/admin/flashs/${id}`),

  /**
   * Crée un nouveau flash
   */
  create: (payload: any): Promise<ApiResponse<Flash>> =>
    post(`/admin/flashs`, payload),

  /**
   * Modifie un flash existant
   */
  update: (id: number, payload: Partial<Flash>): Promise<ApiResponse<Flash>> =>
    put(`/admin/flashs/${id}`, payload),

  /**
   * Supprime un flash
   */
  delete: (id: number): Promise<ApiResponse<null>> =>
    del(`/admin/flashs/${id}`),
};
