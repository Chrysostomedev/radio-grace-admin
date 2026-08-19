// types/publicite.types.ts
export interface Publicite {
  id: number;
  titre: string;
  image: string | null;
  video_url: string | null;
  lien: string | null;
  position: string; // ⚠️ ordre d'affichage ("1", "2"...), PAS une catégorie
  clics: number;
  // Champs optionnels : absents de la réponse actuelle /admin/publicites,
  // à confirmer avec le backend avant de les utiliser dans l'UI
  is_active?: boolean;
  date_debut?: string | null;
  date_fin?: string | null;
  created_at?: string;
  updated_at?: string;
}