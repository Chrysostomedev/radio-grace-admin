"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import axios from "@/core/axios";
import StatsCard from "@/components/cards/StatsCard";
import UserForm from "@/components/form/user-form";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { useRoles } from "@/app/admin/hooks/useRoles";

interface UserRecent {
  id: number;
  nom_complet: string;
  email: string;
  role: string;
  actif: boolean;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  count: number;
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

export default function RolesPage() {
  const { roles, stats, loading, error } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usersList, setUsersList] = useState<UserRecent[]>([]);

  // Charger la liste des utilisateurs récents
  useEffect(() => {
    if (stats?.utilisateurs_recents) {
      setUsersList(stats.utilisateurs_recents);
    }
  }, [stats]);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await axios.post("/admin/users", formData);
      toast.success("Utilisateur créé");
      setShowForm(false);
      // Recharger les données
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#163A2C]/20 border-t-[#F0A93E]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 border border-red-300 p-4">
          <p className="text-red-600">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-red-50 border-red-200";
      case "ANIMATEUR":
        return "bg-[#F0A93E]/5 border-[#F0A93E]/30";
      case "AUDITEUR":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-[#FFFBF0] border-[#163A2C]/10";
    }
  };

  const getRoleTextColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "text-red-600";
      case "ANIMATEUR":
        return "text-[#F0A93E]";
      case "AUDITEUR":
        return "text-blue-600";
      default:
        return "text-[#163A2C]";
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0E241C]">Rôles & Utilisateurs</h1>
          <p className="mt-1 text-[#163A2C]/60">Gestion des rôles et des utilisateurs du système</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[#F0A93E] px-4 py-2 font-semibold text-[#0E241C] hover:bg-[#E0972E]"
        >
          <Plus size={20} /> Nouvel utilisateur
        </button>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total utilisateurs"
          value={stats?.total_users || 0}
        />
        <StatsCard
          label="Utilisateurs actifs"
          value={stats?.users_actifs || 0}
        />
        <StatsCard
          label="Utilisateurs inactifs"
          value={stats?.users_inactifs || 0}
        />
        <StatsCard
          label="Administrateurs"
          value={stats?.par_role.admins || 0}
        />
      </div>

      {/* Stats par rôle */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          label="Animateurs"
          value={stats?.par_role.animateurs || 0}
        />
        <StatsCard
          label="Rédacteurs"
          value={stats?.par_role.redacteurs || 0}
        />
        <StatsCard
          label="Auditeurs"
          value={stats?.par_role.auditeurs || 0}
        />
      </div>

      {/* Section Rôles avec slider vers datatable */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0E241C]">Distribution des rôles</h2>

        {/* Cartes de rôles avec slide animation */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-min">
            {roles.map((role, index) => (
              <div
                key={role.id}
                className="flex-shrink-0 w-80 rounded-xl bg-white border border-[#163A2C]/10 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Role Header */}
                <div className={`p-6 border-b ${getRoleColor(role.name)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${getRoleTextColor(role.name)}`}>
                      {role.name}
                    </h3>
                    <div className="text-3xl font-bold text-[#163A2C]">
                      {role.count}
                    </div>
                  </div>
                  <p className="text-sm text-[#163A2C]/60">
                    {role.count} utilisateur{role.count !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Utilisateurs du rôle */}
                <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
                  {usersList
                    .filter((u) => u.role === role.name)
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0E241C] truncate">
                            {user.nom_complet}
                          </p>
                          <p className="text-xs text-[#163A2C]/60 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {user.actif ? (
                            <Check size={16} className="text-[#1E9D55]" />
                          ) : (
                            <X size={16} className="text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Voir tous bouton */}
                <div className="px-6 py-4 border-t border-[#163A2C]/10 flex items-center justify-between group/btn cursor-pointer hover:bg-[#FFFBF0]">
                  <span className="text-sm font-semibold text-[#F0A93E]">
                    Voir tous les {role.name.toLowerCase()}s
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-[#F0A93E] group-hover/btn:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs récents */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0E241C]">Utilisateurs récents</h2>

        <div className="rounded-lg border border-[#163A2C]/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FFFBF0] border-b border-[#163A2C]/10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0E241C]">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0E241C]">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0E241C]">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0E241C]">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0E241C]">
                  Créé le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#163A2C]/10">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-[#FFFBF0] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#0E241C]">
                    {user.nom_complet}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#163A2C]/70">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                        user.role
                      )} ${getRoleTextColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.actif ? (
                      <div className="flex items-center gap-2 text-[#1E9D55] font-semibold">
                        <div className="w-2 h-2 rounded-full bg-[#1E9D55]" />
                        Actif
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#163A2C]/60 font-semibold">
                        <div className="w-2 h-2 rounded-full bg-[#163A2C]/60" />
                        Inactif
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#163A2C]/70">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <UserForm
          isEditing={false}
          initialData={{}}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
}
