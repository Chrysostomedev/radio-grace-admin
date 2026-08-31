"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import axios from "@/core/axios";
import { useToast } from "@/context/ToastContext";
import PodcastCard from "@/components/cards/PodcastCard";
import Paginate from "@/components/data/paginate";
import PodcastForm from "@/components/form/podcast-form";
import ConfirmModal from "@/components/modals/ConfirmModal";
import PodcastDetailsPanel from "@/components/modals/PodcastDetailsPanel";
import PodcastPreviewModal from "@/components/modals/PodcastPreviewModal";
import type { Podcast, PaginatedResponse } from "@/types/admin";
import { normalizePodcastStatut } from "@/types/admin";

/* ── Option de programme telle que renvoyée par /admin/programmes ── */
interface ProgrammeOption {
    id: number;
    nom?: string;
    name?: string;
}

const CATEGORIES = [
    { id: "all", label: "Toutes" },
    { id: "priere", label: "Prière" },
    { id: "jeunesse", label: "Jeunesse" },
    { id: "acclamez", label: "Acclamez" },
    { id: "actualite", label: "Actualités" },
    { id: "musique", label: "Musique" },
] as const;

const STATUSES = [
    { id: "all", label: "Tous les statuts" },
    { id: "published", label: "Publiés" },
    { id: "draft", label: "Brouillons" },
    { id: "archived", label: "Archivés" },
] as const;

/* ── Helpers ── */

const getErrorMessage = (err: unknown, fallback: string): string => {
    const e = err as { response?: { data?: { message?: string } }; errorMessage?: string };
    return e?.response?.data?.message || e?.errorMessage || fallback;
};

/** Assure que `status` est bien typé après réception API */
const normalizePodcast = (p: Podcast): Podcast => ({
    ...p,
    status: normalizePodcastStatut(p.status ?? p.statut),
});

const podcastTitle = (p: Podcast): string => p.titre || "Sans titre";

export default function PodcastsPage() {
    const toast = useToast();

    /* ── State ── */
    const [view, setView] = useState<"grid" | "list">("grid");
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
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
    const [previewPodcast, setPreviewPodcast] = useState<Podcast | null>(null);

    /* ── Chargement des programmes ── */
    useEffect(() => {
        const fetchProgrammes = async () => {
            try {
                const res = await axios.get("/admin/programmes");
                const data = res.data ?? res;
                setProgrammes(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
                console.error("Erreur chargement programmes", err);
            }
        };
        fetchProgrammes();
    }, []);

    /* ── Chargement des podcasts ── */
    const fetchPodcasts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                ...(search && { search }),
                ...(category !== "all" && { category }),
                ...(status !== "all" && { status_filter: status }),
            };
            const res = await axios.get<PaginatedResponse<Podcast>>("/admin/podcasts", { params });
            const data = res.data ?? res;
            setPodcasts((Array.isArray(data.data) ? data.data : []).map(normalizePodcast));
            setLastPage(data.last_page || 1);
        } catch (err) {
            toast.error("Erreur lors du chargement des podcasts");
            console.error(err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, category, status]);

    useEffect(() => {
        fetchPodcasts();
    }, [fetchPodcasts]);

    /* ── Détails d'un podcast ── */
    const loadPodcastDetails = async (podcast: Podcast) => {
        try {
            const res = await axios.get<PaginatedResponse<Podcast> | Podcast>(`/admin/podcasts/${podcast.id}`);
            const data = (res.data ?? res) as { data?: Podcast } | Podcast;
            const full = ("data" in data && data.data ? data.data : data) as Podcast;
            setSelectedPodcast(normalizePodcast(full));
            setShowDetails(true);
        } catch (err) {
            toast.error("Erreur lors du chargement des détails");
            console.error(err);
        }
    };

    /* ── Actions ── */
    const handlePublish = async (id: number) => {
        try {
            await axios.post(`/admin/podcasts/${id}/publish`);
            toast.success("Podcast publié", "Succès");
            fetchPodcasts();
            setShowDetails(false);
        } catch (err) {
            toast.error(getErrorMessage(err, "Erreur lors de la publication"), "Erreur");
        }
    };

    const handleArchive = async (id: number) => {
        try {
            await axios.post(`/admin/podcasts/${id}/archive`);
            toast.success("Podcast archivé", "Succès");
            fetchPodcasts();
            setShowDetails(false);
        } catch (err) {
            toast.error(getErrorMessage(err, "Erreur lors de l'archivage"), "Erreur");
        }
    };

    /* ── Créer / modifier ── */
    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true);
        try {
            if (editing) {
                await axios.put(`/admin/podcasts/${editing.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Podcast modifié", "Succès");
            } else {
                await axios.post("/admin/podcasts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Podcast créé", "Succès");
            }
            closeForm();
            fetchPodcasts();
        } catch (err) {
            console.error("Erreur submission:", err);
            toast.error(getErrorMessage(err, "Erreur lors de la sauvegarde"), "Erreur");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Suppression ── */
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(`/admin/podcasts/${deleteTarget.id}`);
            toast.success("Podcast supprimé", "Suppression réussie");
            setDeleteTarget(null);
            fetchPodcasts();
        } catch (err) {
            toast.error(getErrorMessage(err, "Erreur lors de la suppression"), "Erreur");
        }
    };

    /* ── Édition : recharge le podcast complet avant d'ouvrir le form ── */
    const openEdit = async (podcast: Podcast) => {
        try {
            const res = await axios.get<{ data?: Podcast } | Podcast>(`/admin/podcasts/${podcast.id}`);
            const data = (res.data ?? res) as { data?: Podcast } | Podcast;
            const full = ("data" in data && data.data ? data.data : podcast) as Podcast;
            setEditing(normalizePodcast(full));
            setShowForm(true);
        } catch (err) {
            toast.error("Erreur lors du chargement du podcast", "Erreur");
            console.error(err);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    /* ── Render ── */
    return (
        <div className="space-y-6 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#0E241C]">Podcasts</h1>
                    <p className="mt-1 text-[#163A2C]/60">Gérez vos podcasts audio et vidéo</p>
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
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>

                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="rounded-lg border border-[#163A2C]/10 bg-white px-3 py-2 text-sm focus:border-[#F0A93E] focus:outline-none"
                >
                    {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                <div className="flex gap-1 border-l border-[#163A2C]/10 pl-3">
                    <button
                        onClick={() => setView("grid")}
                        aria-label="Vue grille"
                        className={`rounded p-2 ${view === "grid" ? "bg-[#F0A93E] text-[#0E241C]" : "text-[#163A2C]/60 hover:text-[#163A2C]"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setView("list")}
                        aria-label="Vue liste"
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
                    <div
                        className={
                            view === "grid"
                                ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "space-y-3"
                        }
                    >
                        {podcasts.map((p) => (
                            <PodcastCard
                                key={p.id}
                                podcast={p}
                                onClick={loadPodcastDetails}
                                onEdit={openEdit}
                                onDelete={(id) => setDeleteTarget(podcasts.find((x) => x.id === id) ?? null)}
                                onPlay={setPreviewPodcast}
                            />
                        ))}
                    </div>

                    {lastPage > 1 && (
                        <Paginate
                            currentPage={page}
                            totalPages={lastPage}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

            {/* Modale de PRÉVISUALISATION (lien YouTube/FB, vidéo, audio) */}
            <PodcastPreviewModal
                podcast={previewPodcast}
                onClose={() => setPreviewPodcast(null)}
            />

            {/* Form Modal */}
            {showForm && (
                <PodcastForm
                    isEditing={!!editing}
                    initialData={editing ? {
                        programme_id: editing.programme_id?.toString() || "",
                        titre: editing.titre,
                        description: editing.description || "",
                        duree: editing.duree ?? undefined,
                        is_premium: editing.is_premium,
                        video_link: editing.video_url?.startsWith("http") ? editing.video_url : "",
                        statut: ((editing.statut ?? "BROUILLON").toUpperCase() as "BROUILLON" | "PUBLIE" | "ARCHIVE"),
                    } : {}}
                    programmes={programmes.map((p) => ({
                        id: p.id.toString(),
                        name: p.nom || p.name || `Programme ${p.id}`,
                    }))}
                    onSubmit={handleSubmit}
                    onClose={closeForm}
                    isSubmitting={submitting}
                />
            )}

            {/* Confirm Delete */}
            {deleteTarget && (
                <ConfirmModal
                    isOpen={!!deleteTarget}
                    title="Supprimer ce podcast ?"
                    message={`"${podcastTitle(deleteTarget)}" sera supprimé définitivement.`}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                    confirmLabel="Supprimer"
                    cancelLabel="Annuler"
                />
            )}

            {/* Details Panel */}
            {showDetails && selectedPodcast && (
                <PodcastDetailsPanel
                    podcast={selectedPodcast}
                    onClose={() => { setShowDetails(false); setSelectedPodcast(null); }}
                    onArchive={handleArchive}
                    onPublish={handlePublish}
                />
            )}
        </div>
    );
}
