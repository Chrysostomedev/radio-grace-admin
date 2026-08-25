"use client";

import { useEffect, useState } from "react";
import { Plus, Search, LayoutGrid, List, Music, Users, Radio } from "lucide-react";
import { toast } from "sonner";
import axios from "@/core/axios";
import AnimateurCard from "@/components/cards/AnimateurCard";
import StatsCard from "@/components/cards/StatsCard";
import Paginate from "@/components/data/paginate";
import AnimateurForm from "@/components/form/animateur-form";
import ConfirmModal from "@/components/modals/ConfirmModal";
import AnimateurDetailsPanel from "@/components/modals/AnimateurDetailsPanel";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  roles?: Array<{ id: number; name: string }>;
}

interface Animateur {
  id: number;
  user_id: number;
  nom_scene: string;
  bio?: string;
  photo?: string;
  facebook?: string;
  whatsapp?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

interface Emission {
  id: number;
  titre: string;
  jour_emission: string;
  heure_debut: string;
  heure_fin: string;
  animateurs: { id: number; nom_scene: string }[];
}

interface AnimateurStats {
  total: number;
  visible: number;
  emissions_count: number;
  followers: number;
}

interface PaginatedResponse {
  data: Animateur[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function AnimateursPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [animateurs, setAnimateurs] = useState<Animateur[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState<Animateur | null>(null);
  const [selectedAnimateur, setSelectedAnimateur] = useState<Animateur | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Animateur | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<AnimateurStats>({
    total: 0,
    visible: 0,
    emissions_count: 0,
    followers: 0,
  });
  const [selectedAnimateurEmissions, setSelectedAnimateurEmissions] = useState<Emission[]>([]);

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/admin/users");
        const data = res.data || res;
        const allUsers = Array.isArray(data.data) ? data.data : [];
        
        // Filtrer les utilisateurs sauf les auditeurs
        const filteredUsers = allUsers.filter((user: User) => {
          const userRole = user.role?.toLowerCase() || "";
          const userRoles = user.roles?.map(r => r.name.toLowerCase()) || [];
          
          return (
            userRole !== "auditeur" &&
            !userRoles.includes("auditeur")
          );
        });
        
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Erreur chargement utilisateurs", err);
      }
    };
    fetchUsers();
  }, []);

  // Charger les stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/admin/animateurs/stats");
        const data = res.data || res;
        setStats(data.data || data);
      } catch (err) {
        console.error("Erreur chargement stats", err);
      }
    };
    fetchStats();
  }, []);

  // Charger les animateurs
  const fetchAnimateurs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        ...(search && { search }),
      };
      const res = await axios.get<PaginatedResponse>("/admin/animateurs", { params });
      const data = res.data || res;
      setAnimateurs(Array.isArray(data.data) ? data.data : []);
      setLastPage(data.last_page || 1);
    } catch (err) {
      toast.error("Erreur lors du chargement des animateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails et émissions d'un animateur
  const loadAnimateurDetails = async (id: number) => {
    try {
      const res = await axios.get<any>(`/admin/animateurs/${id}`);
      const data = res.data || res;
      console.log("✅ Animateur details response:", data);
      const animateurData = data.data || data;
      console.log("✅ Animateur object:", animateurData);
      setSelectedAnimateur(animateurData);

      // Charger les émissions de l'animateur
      try {
        const emissionsRes = await axios.get<any>(`/admin/animateurs/${id}/emissions`);
        const emissionsData = emissionsRes.data || emissionsRes;
        console.log("✅ Emissions response:", emissionsData);
        setSelectedAnimateurEmissions(
          Array.isArray(emissionsData.data) ? emissionsData.data : emissionsData.emissions || []
        );
      } catch (err) {
        console.error("❌ Erreur chargement émissions", err);
        setSelectedAnimateurEmissions([]);
      }

      setShowDetails(true);
    } catch (err) {
      toast.error("Erreur lors du chargement des détails");
      console.error("❌ Erreur chargement détails:", err);
    }
  };

  // Basculer la visibilité
  const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      await axios.patch(`/admin/animateurs/${id}`, {
        is_visible: !currentVisibility,
      });
      toast.success(currentVisibility ? "Animateur masqué" : "Animateur visible");
      fetchAnimateurs();
      setShowDetails(false);
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de la mise à jour");
    }
  };

  useEffect(() => {
    fetchAnimateurs();
  }, [page, search]);

  // Créer/modifier
  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`/admin/animateurs/${editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Animateur modifié");
      } else {
        await axios.post("/admin/animateurs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Animateur créé");
      }
      setShowForm(false);
      setEditing(null);
      fetchAnimateurs();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/admin/animateurs/${deleteTarget.id}`);
      toast.success("Animateur supprimé");
      setDeleteTarget(null);
      fetchAnimateurs();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0E241C]">Animateurs</h1>
          <p className="mt-1 text-[#163A2C]/60">Gérez vos animateurs radio</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#F0A93E] px-4 py-2 font-semibold text-[#0E241C] hover:bg-[#E0972E]"
        >
          <Plus size={20} /> Nouveau
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total animateurs"
          value={stats.total}
          href="/admin/animateurs"
        />
        <StatsCard
          label="Animateurs visibles"
          value={stats.visible}
        />
        <StatsCard
          label="Émissions"
          value={stats.emissions_count}
        />
        <StatsCard
          label="Followers"
          value={stats.followers}
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 rounded-lg bg-[#FFFBF0] p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#163A2C]/40" />
            <input
              type="text"
              placeholder="Chercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#163A2C]/10 bg-white pl-10 py-2 text-sm focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
            />
          </div>
        </div>

        <div className="flex gap-1 border-l border-[#163A2C]/10 pl-3">
          <button
            onClick={() => setView("grid")}
            className={`rounded p-2 ${
              view === "grid"
                ? "bg-[#F0A93E] text-[#0E241C]"
                : "text-[#163A2C]/60 hover:text-[#163A2C]"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded p-2 ${
              view === "list"
                ? "bg-[#F0A93E] text-[#0E241C]"
                : "text-[#163A2C]/60 hover:text-[#163A2C]"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#163A2C]/20 border-t-[#F0A93E]" />
        </div>
      ) : animateurs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-[#FFFBF0] py-12">
          <Users size={48} className="text-[#163A2C]/20 mb-4" />
          <p className="text-[#163A2C]/60">Aucun animateur trouvé</p>
        </div>
      ) : (
        <>
          <div
            className={
              view === "grid"
                ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3"
            }
          >
            {animateurs.map((a) => (
              <AnimateurCard
                key={a.id}
                animateur={a}
                onClick={(animateur) => loadAnimateurDetails(animateur.id)}
                onEdit={(animateur) => {
                  setEditing(animateur);
                  setShowForm(true);
                }}
                onDelete={(id) =>
                  setDeleteTarget(animateurs.find((a) => a.id === id) || null)
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <Paginate
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <AnimateurForm
          isEditing={!!editing}
          initialData={editing ? {
            ...editing,
            user_id: editing.user_id.toString(),
          } : {}}
          users={users}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          isSubmitting={submitting}
        />
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Supprimer cet animateur?"
          message={`"${deleteTarget.nom_scene}" sera supprimé définitivement.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
        />
      )}

      {/* Details Panel */}
      {showDetails && selectedAnimateur && (
        <AnimateurDetailsPanel
          animateur={selectedAnimateur}
          emissions={selectedAnimateurEmissions}
          onClose={() => {
            setShowDetails(false);
            setSelectedAnimateur(null);
          }}
          onToggleVisibility={() =>
            handleToggleVisibility(selectedAnimateur.id, selectedAnimateur.is_visible)
          }
        />
      )}
    </div>
  );
}
