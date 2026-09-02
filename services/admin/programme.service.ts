import axios from "@/core/axios";

export interface Programme {
  id: number;
  titre: string;
  description?: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  links: any;
  meta: any;
  last_page?: number;
}

/**
 * Service pour gérer les programmes/émissions (legacy hook compatibility)
 * Ce service maintient la compatibilité avec les hooks existants
 */
export const programmeService = {
  /**
   * Récupère tous les programmes avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<Programme>> =>
    axios.get(`/admin/programmes`, { params }).then(r => r.data),

  /**
   * Récupère un programme spécifique
   */
  getById: (id: number): Promise<ApiResponse<Programme>> =>
    axios.get(`/admin/programmes/${id}`).then(r => r.data),

  /**
   * Crée un nouveau programme
   */
  create: (payload: FormData): Promise<ApiResponse<Programme>> =>
    axios.post(`/admin/programmes`, payload).then(r => r.data),

  /**
   * Modifie un programme existant
   */
  update: (id: number, payload: FormData): Promise<ApiResponse<Programme>> =>
    axios.put(`/admin/programmes/${id}`, payload).then(r => r.data),

  /**
   * Supprime un programme
   */
  delete: (id: number): Promise<any> =>
    axios.delete(`/admin/programmes/${id}`).then(r => r.data),
};
