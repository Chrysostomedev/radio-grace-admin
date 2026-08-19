import axios from "@/core/axios";

export const evenementService = {
  getAll: (params?: any) => axios.get("/admin/evenements", { params }),
  getOne: (id: number | string) => axios.get(`/admin/evenements/${id}`),
  create: (data: any) => axios.post("/admin/evenements", data),
  update: (id: number | string, data: any) => axios.put(`/admin/evenements/${id}`, data),
  remove: (id: number | string) => axios.delete(`/admin/evenements/${id}`),
};