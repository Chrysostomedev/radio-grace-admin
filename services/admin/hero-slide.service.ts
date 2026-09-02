import { get, post, put, del } from "@/core/axios";

export interface HeroSlide {
  id: number;
  titre?: string;
  sous_titre?: string;
  type: 'IMAGE' | 'VIDEO';
  image?: string;
  video?: string;
  lien?: string;
  ordre?: number;
  actif?: boolean;
  created_at?: string;
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
 * Service pour gérer les bannieres Hero Slides
 * GET    /admin/hero-slides                 - liste toutes les bannieres
 * POST   /admin/hero-slides                 - crée une nouvelle banniere
 * PUT    /admin/hero-slides/{id}            - modifie une banniere
 * DELETE /admin/hero-slides/{id}            - supprime une banniere
 * POST   /admin/hero-slides/{id}/toggle     - active/désactive une banniere
 */
export const heroSlideService = {
  /**
   * Récupère toutes les bannieres avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<HeroSlide>> =>
    get(`/admin/hero-slides`, { params }),

  /**
   * Récupère une banniere spécifique
   */
  getOne: (id: number): Promise<ApiResponse<HeroSlide>> =>
    get(`/admin/hero-slides/${id}`),

  /**
   * Crée une nouvelle banniere
   */
  create: (payload: FormData): Promise<ApiResponse<HeroSlide>> =>
    post(`/admin/hero-slides`, payload),

  /**
   * Modifie une banniere existante
   */
  update: (id: number, payload: FormData): Promise<ApiResponse<HeroSlide>> =>
    put(`/admin/hero-slides/${id}`, payload),

  /**
   * Supprime une banniere
   */
  delete: (id: number): Promise<ApiResponse<null>> =>
    del(`/admin/hero-slides/${id}`),

  /**
   * Active/désactive une banniere
   */
  toggle: (id: number): Promise<ApiResponse<HeroSlide>> =>
    post(`/admin/hero-slides/${id}/toggle`, {}),
};
