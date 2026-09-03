import { get, post, put } from "@/core/axios";

export interface IntentionPriere {
  id: number;
  intention: string;
  description?: string;
  nom?: string;
  telephone?: string;
  is_public: boolean;
  is_anonyme: boolean;
  statut?: 'EN_ATTENTE' | 'PRIE' | 'CLOTURE';
  montant_don?: number;
  statut_paiement?: 'NON_PAYEE' | 'EN_ATTENTE' | 'PAYEE' | 'ERREUR' | 'ANNULEE';
  transaction_id?: string;
  moyen_paiement?: string;
  paid_at?: string;
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

interface StatistiquesIntentions {
  total: number;
  payees: number;
  en_attente: number;
  non_payees: number;
  erreur: number;
  total_montant?: number;
  total_montant_paye?: number;
}

/**
 * Service pour gérer les intentions de prière en admin
 * GET    /admin/intentions-priere                 - liste toutes les intentions
 * GET    /admin/intentions-priere/{id}            - détail d'une intention
 * PUT    /admin/intentions-priere/{id}            - modifie une intention
 * GET    /admin/intentions-priere/statistiques    - stats des paiements
 */
export const intentionService = {
  /**
   * Récupère toutes les intentions avec pagination
   */
  getAll: (params?: any): Promise<PaginatedResponse<IntentionPriere>> =>
    get(`/admin/intentions-priere`, { params }),

  /**
   * Récupère une intention spécifique
   */
  getOne: (id: number): Promise<ApiResponse<IntentionPriere>> =>
    get(`/admin/intentions-priere/${id}`),

  /**
   * Modifie une intention (généralement: marquer comme priée, archiver, etc.)
   */
  update: (id: number, payload: Partial<IntentionPriere>): Promise<ApiResponse<IntentionPriere>> =>
    put(`/admin/intentions-priere/${id}`, payload),

  /**
   * Récupère les statistiques des paiements
   */
  getStatistiques: (): Promise<ApiResponse<StatistiquesIntentions>> =>
    get(`/admin/intentions-priere/statistiques`),
};
