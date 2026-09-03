import axios from "@/core/axios";

export interface Participant {
  id: number;
  nom_participant?: string;
  email_participant?: string;
  telephone_participant?: string;
  statut: string;
  created_at: string;
}

export interface Evenement {
  id: number;
  type: string;
  titre: string;
  description?: string;
  lieu?: string;
  image?: string;
  date_debut: string;
  date_fin?: string;
  responsable?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  statut: string;
  created_at: string;
}

export const adminEvenementsService = {
  /**
   * GET /api/v1/admin/evenements
   * List all events
   */
  getEvenements: async (): Promise<{ data: Evenement[] }> => {
    return axios.get("/admin/evenements");
  },

  /**
   * GET /api/v1/admin/evenements/{id}
   * Get single event details
   */
  getEvenement: async (id: number): Promise<{ data: Evenement }> => {
    return axios.get(`/admin/evenements/${id}`);
  },

  /**
   * GET /api/v1/admin/evenements/{id}/participants
   * Get participants for an event (admin endpoint - requires authentication)
   */
  getParticipants: async (id: number): Promise<{ success: boolean; data: Participant[]; count: number }> => {
    return axios.get(`/admin/evenements/${id}/participants`);
  },

  /**
   * POST /api/v1/admin/evenements
   * Create new event
   */
  createEvenement: async (data: any): Promise<{ data: Evenement }> => {
    return axios.post("/admin/evenements", data);
  },

  /**
   * PUT /api/v1/admin/evenements/{id}
   * Update event
   */
  updateEvenement: async (id: number, data: any): Promise<{ data: Evenement }> => {
    return axios.put(`/admin/evenements/${id}`, data);
  },

  /**
   * DELETE /api/v1/admin/evenements/{id}
   * Delete event
   */
  deleteEvenement: async (id: number): Promise<{ success: boolean }> => {
    return axios.delete(`/admin/evenements/${id}`);
  },
};
