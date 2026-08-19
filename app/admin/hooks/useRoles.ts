import { useEffect, useState } from "react";
import axios from "@/core/axios";

interface Role {
  id: number;
  name: string;
  count: number;
}

interface UserRecent {
  id: number;
  nom_complet: string;
  email: string;
  role: string;
  actif: boolean;
  created_at: string;
}

interface RolesStats {
  total_users: number;
  users_actifs: number;
  users_inactifs: number;
  par_role: {
    admins: number;
    animateurs: number;
    redacteurs: number;
    auditeurs: number;
  };
  utilisateurs_recents: UserRecent[];
}

interface RolesResponse {
  success: boolean;
  roles: Role[];
  stats: RolesStats;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<RolesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get<RolesResponse>("/admin/roles");
        const data = response.data || response;
        
        if (data.roles) {
          setRoles(data.roles);
        }
        if (data.stats) {
          setStats(data.stats);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des rôles");
        console.error("Erreur chargement rôles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, stats, loading, error };
}
