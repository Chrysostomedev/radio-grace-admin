"use client";

import { useEffect, useState } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import axios from "@/core/axios";
import { useToast } from "@/context/ToastContext";
import PodcastCard from "@/components/cards/PodcastCard";
import Paginate from "@/components/data/paginate";
import PodcastForm from "@/components/form/podcast-form";
import ConfirmModal from "@/components/modals/ConfirmModal";
import PodcastDetailsPanel from "@/components/modals/PodcastDetailsPanel";

interface Programme {
  id: string;
  nom?: string;
  name?: string;
}

interface Podcast {
  id: number;
  title?: string;
  titre?: string;
  category?: string;
  status?: "published" | "draft" | "archived";
  statut?: string;
  created_by?: string;
  created_at?: string;
  description?: string;
  image?: string;
  duration?: number;
  duree?: number;
  audio_url?: string;
  views_count?: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  downloads_count?: number;
  updated_at?: string;
  programme_id?: number | string;
  is_premium?: boolean;
}

interface PaginatedResponse {
  data: Podcast[];
  current_page: number;
  last_page: number;
  total: number;
}

const CATEGORIES = [
  { id: "all", label: "Toutes" },
  { id: "priere", label: "Prière" },
  { id: "jeunesse", label: "Jeunesse" },
  { id: "acclamez", label: "Acclamez" },
  { id: "actualite", label: "Actualités" },
  { id: "musique", label: "Musique" },
];

const STATUSES = [
  { id: "all", label: "Tous les statuts" },
  { id: "published", label: "Publiés" },
  { id: "draft", label: "Brouillons" },
  { id: "archived", label: "Archivés" },
];

export default function PodcastsPage() {
  const toast = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Podcast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Charger les programmes
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await axios.get("/admin/programmes");
        const data = res.data || res;
        setProgrammes(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Erreur chargement programmes", err);
      }
    };
    fetchProgrammes();
  }, []);

  // Charger les podcasts
  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(status !== "all" && { status_filter: status }),
      };
      const res = await axios.get<PaginatedResponse>("/admin/podcasts", { params });
      const data = res.data || res;
      setPodcasts(Array.isArray(data.data) ? data.data : []);
      setLastPage(data.last_page || 1);
    } catch (err) {
      toast.error("Erreur lors du chargement des podcasts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails d'un podcast
  const loadPodcastDetails = async (id: number) => {
    try {
      const res = await axios.get<any>(`/admin/podcasts/${id}`);
      const data = res.data || res;
      setSelectedPodcast(data.data || data);
      setShowDetails(true);
    } catch (err) {
      toast.error("Erreur lors du chargement des détails");
      console.error(err);
    }
  };

  // Publier un podcast
  const handlePublish = async (id: number) => {
    try {
      await axios.post(`/admin/podcasts/${id}/publish`);
      toast.success("Podcast publié", "Succès");
      fetchPodcasts();
      setShowDetails(false);
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de la publication", "Erreur");
    }
  };

  // Archiver un podcast
  const handleArchive = async (id: number) => {
    try {
      await axios.post(`/admin/podcasts/${id}/archive`);
      toast.success("Podcast archivé", "Succès");
      fetchPodcasts();
      setShowDetails(false);
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de l'archivage", "Erreur");
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [page, search, category, status]);

  // Créer/modifier un podcast
  // IMPORTANT: Si audio_url contient un fichier, le backend le met en temp/local
  // puis dispatch UploadPodcastAudioJob qui l'upload vers R2 en arrière-plan
  // via Redis queue worker. Le frontend reçoit audio_status='EN_COURS' et c'est normal.
  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      if (editing) {
        // Pour l'update, envoyer en multipart si fichiers, sinon JSON
        await axios.put(`/admin/podcasts/${editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Podcast modifié", "Succès");
      } else {
        // Pour la création, envoyer en multipart (fichiers + données)
        await axios.post("/admin/podcasts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Podcast créé", "Succès");
      }
      setShowForm(false);
      setEditing(null);
      fetchPodcasts();
    } catch (err: any) {
      console.error("Erreur submission:", err);
      const errorMsg = err?.response?.data?.message || err?.errorMessage || "Erreur lors de la sauvegarde";
      toast.error(errorMsg, "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un podcast
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/admin/podcasts/${deleteTarget.id}`);
      toast.success("Podcast supprimé", "Suppression réussie");
      setDeleteTarget(null);
      fetchPodcasts();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Erreur lors de la suppression", "Erreur");
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0E241C]">Podcasts</h1>
          <p className="mt-1 text-[#163A2C]/60">Gérez vos podcasts audio</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#F0A93E] px-4 py-2 font-semibold text-[#0E241C] hover:bg-[#E0972E]"
        >
          <Plus size={20} /> Nouveau
        </button>
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#163A2C]/10 bg-white pl-10 py-2 text-sm focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
            />
          </div>
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#163A2C]/10 bg-white px-3 py-2 text-sm focus:border-[#F0A93E] focus:outline-none"
        >
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#163A2C]/10 bg-white px-3 py-2 text-sm focus:border-[#F0A93E] focus:outline-none"
        >
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        <div className="flex gap-1 border-l border-[#163A2C]/10 pl-3">
          <button
            onClick={() => setView("grid")}
            className={`rounded p-2 ${view === "grid" ? "bg-[#F0A93E] text-[#0E241C]" : "text-[#163A2C]/60 hover:text-[#163A2C]"}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded p-2 ${view === "list" ? "bg-[#F0A93E] text-[#0E241C]" : "text-[#163A2C]/60 hover:text-[#163A2C]"}`}
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
      ) : podcasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-[#FFFBF0] py-12">
          <p className="text-[#163A2C]/60">Aucun podcast trouvé</p>
        </div>
      ) : (
        <>
          <div className={view === "grid" ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
            {podcasts.map(p => (
              <PodcastCard
                key={p.id}
                podcast={p}
                onClick={(podcast) => loadPodcastDetails(podcast.id)}
                onEdit={async (podcast) => { 
                  try {
                    const res = await axios.get<any>(`/admin/podcasts/${podcast.id}`);
                    const fullData = res.data?.data || res.data || podcast;
                    setEditing(fullData);
                    setShowForm(true);
                  } catch (err) {
                    toast.error("Erreur lors du chargement du podcast", "Erreur");
                    console.error(err);
                  }
                }}
                onDelete={(id) => setDeleteTarget(podcasts.find(p => p.id === id) || null)}
                onPlay={(p) => p.audio_url && window.open(p.audio_url, "_blank", "noopener,noreferrer")}
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
        <PodcastForm
          isEditing={!!editing}
          initialData={editing ? {
            programme_id: editing.programme_id?.toString() || "",
            titre: editing.titre || editing.title || "",
            description: editing.description || "",
            duree: editing.duree || editing.duration || undefined,
            is_premium: editing.is_premium || false,
            statut: ((editing.statut || editing.status || "BROUILLON").toUpperCase() as "BROUILLON" | "PUBLIE" | "ARCHIVE"),
          } : {}}
          programmes={programmes.map(p => ({
            id: p.id.toString(),
            name: p.nom || p.name || `Programme ${p.id}`,
          }))}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null); }}
          isSubmitting={submitting}
        />
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Supprimer ce podcast?"
          message={`"${deleteTarget.title}" sera supprimé définitivement.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
        />
      )}

      {/* Details Panel */}
      {showDetails && selectedPodcast && (
        <PodcastDetailsPanel
          podcast={selectedPodcast as any}
          onClose={() => { setShowDetails(false); setSelectedPodcast(null); }}
          onArchive={handleArchive}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
