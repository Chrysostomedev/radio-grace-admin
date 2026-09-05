/**
 * Service pour gérer le profil utilisateur (admin/rédacteur/animateur)
 *
 * Endpoints:
 * GET    /admin/profile              - Récupère le profil complet
 * PATCH  /admin/profile              - Met à jour les infos (nom, prénom, email, phone, adresse)
 * PATCH  /admin/profile/password     - Change le mot de passe
 */

import { get, patch } from "@/core/axios";

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  prenom?: string;
  nom?: string;
  email?: string;
  phone?: string | null;
}

export interface UpdatePasswordPayload {
  password_actuel: string;
  password: string;
  password_confirmation: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export const profileService = {
  /**
   * GET /admin/profile
   * Récupère le profil complet de l'utilisateur authentifié
   */
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    get("/admin/profile"),

  /**
   * PATCH /admin/profile
   * Met à jour les informations du profil (nom, prénom, email, phone, adresse)
   * @param payload - Champs à mettre à jour
   */
  updateProfile: (payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> =>
    patch("/admin/profile", payload),

  /**
   * PATCH /admin/profile/password
   * Change le mot de passe de l'utilisateur
   * @param payload - Ancien mot de passe + nouveau mot de passe + confirmation
   */
  updatePassword: (payload: UpdatePasswordPayload): Promise<ApiResponse<null>> =>
    patch("/admin/profile/password", payload),
};
