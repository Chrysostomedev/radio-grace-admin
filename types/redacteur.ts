// types/redacteur.ts — scope REDACTEUR (lecture large, écriture limitée)
import type {
  Actualite,
  ActualitePayload,
  CategorieActu,
  CategorieActuPayload,
  Tag,
  TagPayload,
  Evenement,
  Commentaire,
  Podcast,
  PodcastPayload,
  Programme,
  DashboardStats,
} from "@/types/admin";
import type { AuthUser } from "@/types";

// REDACTEUR peut voir son profil / users limités (pas de create/delete users)
export type RedacteurUser = Pick<AuthUser, "id" | "nom_complet" | "email" | "role" | "avatar">;

// ── Ce qu'il peut LISTER (GET) ──
export interface RedacteurDashboard extends Pick<DashboardStats, "actualites" | "taches_en_retard" | "emissions_recentes"> {}

// ── Ce qu'il peut CRUD ──
// Actualités : full CRUD mais pas de suppression si PUBLIE (règle backend)
export type RedacteurActualite = Actualite;
export type RedacteurActualitePayload = ActualitePayload & {
  statut: "BROUILLON" | "EN_COURS" | "PUBLIE"; // pas RETARD (admin only)
};

// Catégories / Tags : lecture + création (pas delete)
export type RedacteurCategorie = CategorieActu;
export type RedacteurCategoriePayload = CategorieActuPayload;
export type RedacteurTag = Tag;
export type RedacteurTagPayload = TagPayload;

// Podcasts : peut créer/lier à ses émissions seulement
export type RedacteurPodcast = Podcast;
export type RedacteurPodcastPayload = Omit<PodcastPayload, "is_premium"> & { is_premium?: false };

// Evenements : lecture seule + peut proposer (EN_COURS) mais pas valider REALISE/ANNULE
export type RedacteurEvenement = Evenement;
export type RedacteurEvenementPayload = Pick<Evenement, "titre" | "description" | "lieu" | "date_debut"> & {
  type: Evenement["type"];
};

// Programmes : lecture seule pour rattacher podcast
export type RedacteurProgramme = Pick<Programme, "id" | "titre" | "categorie" | "animateur">;

// Commentaires : modération (masquer) pas delete hard
export type RedacteurCommentaire = Commentaire;
export interface RedacteurCommentaireModeration {
  is_visible?: boolean;
}

// ── Payloads interdits (pour que TS bloque) ──
export type ForbiddenForRedacteur = "produits" | "commandes" | "dons" | "publicites" | "live-sessions" | "users" | "taches";