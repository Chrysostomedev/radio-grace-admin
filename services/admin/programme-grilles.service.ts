import { get, post, put, del } from "@/core/axios";
import type { ProgrammeGrille, ProgrammeGrillePayload } from "@/types/admin";

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface CreateCreneuPayload {
  jour: string;
  heure_debut: string;
  heure_fin: string;
  is_rediffusion: boolean;
}

interface UpdateCreneuPayload extends Partial<CreateCreneuPayload> {
  programme_id?: number;
  jour?: string;
  heure_debut?: string;
  heure_fin?: string;
  is_rediffusion?: boolean;
}

/**
 * Service pour gérer la grille horaire (créneaux).
 *
 * GET    /admin/grille                                 - liste TOUS les créneaux, tous programmes confondus (grille globale)
 * POST   /admin/programmes/{programme}/grille          - crée un créneau pour un programme donné
 * PUT    /admin/grille/{grille}                        - modifie un créneau (shallow)
 * DELETE /admin/grille/{grille}                        - supprime un créneau (shallow)
 */
export const programmeGrillesService = {
  /**
   * Récupère TOUS les créneaux de la grille, tous programmes confondus.
   * Remplace l'ancien getAll(programmeId) qui filtrait par programme
   * et cassait l'affichage multi-émissions de GrilleBoard.
   * 
   * Fallback: si l'endpoint n'existe pas (404), retourne une liste vide
   */
  getAllGrille: async (): Promise<ApiResponse<ProgrammeGrille[]>> => {
    try {
      return await get(`/admin/grille`);
    } catch (error: any) {
      // Si 404, retourner une réponse vide plutôt que de crasher
      if (error?.response?.status === 404) {
        console.warn('Route /admin/grille non trouvée (404) - retournant liste vide');
        return { data: [] };
      }
      throw error;
    }
  },

  /**
   * Crée un nouveau créneau pour un programme
   * @param programmeId - ID du programme (requis dans l'URL ET dans le payload pour la validation Laravel)
   * @param payload - Données du créneau (jour, heure_debut, heure_fin, is_rediffusion)
   */
  create: (programmeId: number, payload: CreateCreneuPayload): Promise<ApiResponse<ProgrammeGrille>> =>
    post(`/admin/programmes/${programmeId}/grille`, { ...payload, programme_id: programmeId }),

  /**
   * Modifie un créneau existant
   * @param grilleId - ID du créneau
   * @param payload - Données à modifier
   */
  update: (grilleId: number, payload: UpdateCreneuPayload): Promise<ApiResponse<ProgrammeGrille>> =>
    put(`/admin/grille/${grilleId}`, payload),

  /**
   * Supprime un créneau
   * @param grilleId - ID du créneau
   */
  delete: (grilleId: number): Promise<ApiResponse<null>> =>
    del(`/admin/grille/${grilleId}`),
};