import { apiClient } from "@/core/axios";
import { Publicite } from "@/types/publicite.types";

export const publicitesService = {
  getPublicites: async (position?: string): Promise<{ data: Publicite[]; meta?: any; links?: any }> => {
    const params = position ? { position } : {};
    const { data } = await apiClient.get("/admin/publicites", { params });
    return data;
  },

  createPublicite: async (payload: FormData): Promise<Publicite> => {
    const { data } = await apiClient.post<{ data: Publicite }>("/admin/publicites", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  updatePublicite: async (id: number, payload: FormData): Promise<Publicite> => {
    payload.append("_method", "PUT");
    const { data } = await apiClient.post<{ data: Publicite }>(`/admin/publicites/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  deletePublicite: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/publicites/${id}`);
  },
};
