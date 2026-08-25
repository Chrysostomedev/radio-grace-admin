import { get } from "@/core/axios";

export interface DashboardApi {
  compteurs: { total_contenus: number; emissions_actives: number; evenements_a_venir: number };
  actualites: { total: number; en_cours: number; publiees: number; en_retard: number };
  emissions_recentes: { id: number; titre: string; nombre_contenus: number }[];
  repartition_contenus: { label: string; publies: number; total: number; ratio: number }[];
  taches_en_retard: {
    id: number; nom: string;
    assigne: { id: number; nom: string; avatar: string | null; initiales: string } | null;
    date_debut: string; date_echeance: string;
    progression: number; priorite: "FAIBLE"|"MOYEN"|"ELEVE"; statut: string;
  }[];
  utilisateurs?: {
    total_users: number;
    users_actifs: number;
    par_role?: {
      admins: number;
      auditeurs: number;
      [key: string]: number;
    };
    utilisateurs_recents?: Array<{
      id: number;
      name: string;
      email: string;
      nom_complet: string;
      role: string;
      actif: boolean;
      roles?: Array<{ id: number; name: string }>;
      created_at: string;
    }>;
  };
}

export const dashboardService = {
  get: (): Promise<{ data: DashboardApi }> => get("/admin/dashboard"),
};