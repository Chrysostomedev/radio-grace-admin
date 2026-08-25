import { get, post, put, del } from "@/core/axios";
import { ListParams, ApiError } from "@/types";

export interface Actualite {
  id: number;
  titre: string;
  slug: string;
  contenu?: string;
  categorie: { id: number; nom: string; slug?: string } | null;
  categorie_id: number;
  statut: "BROUILLON" | "EN_COURS" | "PUBLIE" | "RETARD";
  image: string | null;
  vues: number;
  likes?: number;
  favoris?: number;
  partages?: number;
  commentaires_count?: number;
  user_id: number;
  en_cours?: number;
  terminees?: number;
  en_retard?: number;
  importance?: string;
  created_at: string;
  updated_at?: string;
}

export const actualiteService = {
  list: (
    params: {
      search?: string;
      statut?: string;
      categorie_id?: number;
      page?: number;
      per_page?: number;
    } = {}
  ) => get("/admin/actualites", { params }) as Promise<any>, // 👈 Encapsulé dans { params }

  get: (id: number) =>
    get(`/admin/actualites/${id}`) as Promise<{ data: Actualite }>,

  create: (formData: FormData) =>
    post("/admin/actualites", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, formData: FormData) => {
    formData.append("_method", "PUT");
    return post(`/admin/actualites/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number) => del(`/admin/actualites/${id}`),
};