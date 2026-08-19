import axios from "@/core/axios";
import type { Programme, ProgrammeGrille, ProgrammeGrillePayload } from "@/types/admin";

export const programmeService = {
  // --- Programmes ---
getAll: (params?: any) => axios.get("/admin/programmes", { params }),
  getById: (id: number) => axios.get(`/admin/programmes/${id}`),
  create: (formData: FormData) => axios.post("/admin/programmes", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: number, formData: FormData) => axios.post(`/admin/programmes/${id}?_method=PUT`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: number) => axios.delete(`/admin/programmes/${id}`),

  // --- Grille ---
  getGrille: (programmeId: number) => axios.get(`/admin/programmes/${programmeId}/grille`),
  addCreneau: (programmeId: number, payload: ProgrammeGrillePayload) => axios.post(`/admin/programmes/${programmeId}/grille`, payload),
  updateCreneau: (grilleId: number, payload: ProgrammeGrillePayload) => axios.put(`/admin/grille/${grilleId}`, payload),
  deleteCreneau: (grilleId: number) => axios.delete(`/admin/grille/${grilleId}`),
};