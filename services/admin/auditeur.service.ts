/**
 * Service pour gérer les auditeurs (utilisateurs mobiles)
 */

import { get } from "@/core/axios";

export interface AuditeurUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export interface AuditeurStats {
  commandes_count: number;
  favoris_count: number;
  dons_count: number;
  dons_total: number;
  intentions_count: number;
}

export interface AuditeurActivity {
  jour: string;
  count?: number;
  total?: number;
}

export interface Auditeur {
  id: number;
  user: AuditeurUser;
  stats: AuditeurStats;
  created_at: string;
  updated_at: string;
}

export interface AuditeurDetail extends Auditeur {
  activity?: {
    dons_par_jour: AuditeurActivity[];
    intentions_par_jour: AuditeurActivity[];
    commandes_par_jour: AuditeurActivity[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export const auditeurService = {
  /**
   * GET /admin/auditeurs
   * Liste tous les auditeurs avec pagination et stats
   */
  getAll: (page: number = 1, search: string = ""): Promise<ApiResponse<Auditeur[]>> =>
    get("/admin/auditeurs", { params: { page, search, per_page: 20 } }),

  /**
   * GET /admin/auditeurs/{id}
   * Récupère les détails d'un auditeur avec stats par jour
   */
  getById: (id: number): Promise<ApiResponse<AuditeurDetail>> =>
    get(`/admin/auditeurs/${id}`),
};
