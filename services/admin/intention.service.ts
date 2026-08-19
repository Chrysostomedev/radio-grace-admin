import axios from "@/core/axios";
export const intentionService = {
  getAll: (params?: any) => axios.get("/admin/intentions-priere", { params }),
  getOne: (id: string | number) => axios.get(`/admin/intentions-priere/${id}`),
  updateStatut: (id: string | number, statut: string) => axios.put(`/admin/intentions-priere/${id}`, { statut }),
};