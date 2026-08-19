// types/admin.ts — entités & payloads du back-office (ADMIN + ANIMATEUR + REDACTEUR)
import type { AuthUser, Role } from "@/types";

/* ============================================================
 * UTILISATEURS
 * ============================================================ */
export type User = AuthUser;

export interface UserPayload {
    name: string;
    nom?: string;
    prenom?: string;
    email: string;
    phone?: string;
    password?: string; // requis à la création, optionnel à l'update
    role_id: number;
    is_active?: boolean;
    avatar?: File;
}

/* ============================================================
 * ANIMATEURS
 * ============================================================ */
export interface Animateur {
    id: number;
    nom_scene: string;
    bio: string | null;
    photo: string | null;
    facebook: string | null;
    whatsapp: string | null;
    is_visible: boolean;
    programmes_count?: number;
}

export interface AnimateurPayload {
    user_id: number;
    nom_scene: string;
    bio?: string;
    photo?: File;
    facebook?: string;
    whatsapp?: string;
    is_visible?: boolean;
}

/* ============================================================
 * PROGRAMMES & GRILLE
 * ============================================================ */
export type ProgrammeCategorie = "ACCLAMEZ" | "PRIERE" | "JEUNESSE" | "ACTUALITE" | "MUSIQUE";
export type ProgrammeStatut = "ACTIF" | "INACTIF" | "EN_DIRECT" | "REDIFFUSION";
export type Jour = "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI" | "DIMANCHE" | "TOUS";

export interface ProgrammeGrille {
    id: number;
    programme_id: number;
    jour: Jour;
    heure_debut: string; // "HH:mm"
    heure_fin: string;
    is_rediffusion: boolean;
}

export interface ProgrammeGrillePayload {
    jour: Jour;
    heure_debut: string;
    heure_fin: string;
    is_rediffusion?: boolean;
}

export interface Programme {
    id: number;
    titre: string;
    slug: string;
    categorie: ProgrammeCategorie;
    description: string | null;
    image: string | null;
    animateur: Animateur | null;
    statut: ProgrammeStatut;
    en_direct: boolean;
    vues: number;
    grille?: ProgrammeGrille[];
    podcasts_count?: number;
}

export interface ProgrammePayload {
    titre: string;
    slug?: string;
    categorie: ProgrammeCategorie;
    description?: string;
    image?: File;
    animateur_id?: number | null;
    statut: ProgrammeStatut;
}

/* ============================================================
 * PODCASTS
 * ============================================================ */
export interface Podcast {
    id: number;
    titre: string;
    description: string | null;
    audio_url: string | null;
    video_url: string | null;
    image: string | null;
    duree: number | null;
    duree_formatee: string;
    is_premium: boolean;
    vues: number;
    programme: Programme | null;
    commentaires_count?: number;
}

export interface PodcastPayload {
    programme_id: number;
    titre: string;
    description?: string;
    audio_url?: File;
    video_url?: File;
    image?: File;
    duree?: number;
    is_premium?: boolean;
}

/* ============================================================
 * CMS — CATÉGORIES, ACTUALITÉS, TAGS, COMMENTAIRES
 * ============================================================ */
export interface CategorieActu {
    id: number;
    name: string;
    slug: string;
    color: string;
    actualites_count?: number;
}

export interface CategorieActuPayload {
    name: string;
    slug?: string;
    color?: string;
}

export interface Tag {
    id: number;
    name: string;
    actualites_count?: number;
}

export interface TagPayload {
    name: string;
}

export type ActualiteStatut = "BROUILLON" | "EN_COURS" | "PUBLIE" | "RETARD";
export type ActualiteImportance = "STANDARD" | "A_LA_UNE" | "IMPORTANT";

export interface Actualite {
    id: number;
    titre: string;
    slug: string;
    chapeau: string | null;
    contenu?: string; // présent uniquement sur show()
    image: string | null;
    categorie: CategorieActu;
    auteur: User;
    tags: Tag[];
    statut: ActualiteStatut;
    importance: ActualiteImportance;
    est_en_retard: boolean;
    stats: { vues: number; likes: number; shares: number; commentaires?: number };
    published_at: string | null;
    created_at: string;
}

export interface ActualitePayload {
    categorie_id: number;
    titre: string;
    slug?: string;
    chapeau?: string;
    contenu: string;
    image?: File;
    statut: ActualiteStatut;
    importance: ActualiteImportance;
    published_at?: string;
    tags?: number[];
}

export interface Commentaire {
    id: number;
    contenu: string;
    auteur: { nom: string; avatar: string | null };
    reponses?: Commentaire[];
    created_at: string;
}

/* ============================================================
 * ÉVÉNEMENTS
 * ============================================================ */
export type EvenementType = "RETRAITE" | "MESSE" | "CONCERT" | "FORMATION";
export type EvenementStatut = "PLANIFIE" | "EN_COURS" | "REALISE" | "ANNULE";

export interface Evenement {
    id: number;
    type: EvenementType;
    titre: string;
    description: string | null;
    lieu: string | null;
    date_debut: string;
    date_fin: string | null;
    responsable: User | null;
    statut: EvenementStatut;
    est_a_venir: boolean;
}

export interface EvenementPayload {
    type: EvenementType;
    titre: string;
    description?: string;
    lieu?: string;
    date_debut: string;
    date_fin?: string;
    responsable_id?: number;
    statut: EvenementStatut;
}

/* ============================================================
 * BOUTIQUE — PRODUITS, IMAGES, COMMANDES
 * ============================================================ */
export type ProduitCategorie = "livre" | "textile" | "audio" | "accessoire";
export type ProduitBadge = "BEST_SELLER" | "NOUVEAU" | "STOCK_FAIBLE" | "PROMO" | "RUPTURE";

export interface ProduitImage {
    id: number;
    url: string;
    is_principale: boolean;
}

export interface Produit {
    id: number;
    name: string;
    slug: string;
    categorie: ProduitCategorie;
    description?: string | null;
    prix: number;
    old_prix: number | null;
    en_promotion: boolean;
    pourcentage_reduction: number;
    stock: number;
    ventes: number;
    badge: ProduitBadge | null;
    dispo_percent: number;
    images?: ProduitImage[];
    image_principale?: string | null;
}

export interface ProduitPayload {
    name: string;
    slug?: string;
    categorie: ProduitCategorie;
    description?: string;
    prix: number;
    old_prix?: number;
    stock: number;
    badge?: ProduitBadge;
    images?: File[];
}

export type CommandeStatut = "NEW" | "PREPA" | "LIVRAISON" | "LIVRE" | "ANNULE";

export interface CommandeItem {
    id: number;
    produit: { id: number; name: string; image: string | null };
    qte: number;
    prix_unitaire: number;
    sous_total: number;
}

export interface Commande {
    id: number;
    code: string;
    client_nom: string;
    client_phone: string;
    adresse: string | null;
    montant_total: number;
    statut: CommandeStatut;
    est_annulable: boolean;
    items?: CommandeItem[];
    nombre_articles?: number;
    created_at: string;
}

/* ============================================================
 * LIVE & PUBLICITÉS
 * ============================================================ */
export type LiveType = "AUDIO" | "VIDEO";
export type LiveSignal = "OK" | "FAIBLE";

export interface LiveSessionObsConfig {
    serveur: string;
    cle_de_flux: string;
}

export interface LiveSession {
    id: number;
    titre: string;
    type: LiveType;
    stream_url: string | null; // null tant que le webhook on-publish n'a pas confirmé le flux
    is_live: boolean;
    auditeurs_live: number;
    signal: LiveSignal;
    duree_en_cours_minutes: number | null;
    programme: Programme | null;
    obs?: LiveSessionObsConfig; // présent uniquement sur les endpoints /admin/*
}

export interface LiveSessionPayload {
    titre: string;
    programme_id?: number | null;
    type: LiveType;
}

export type PubliciteFormat = "PLAYER" | "BANNER" | "INTERSTITIEL" | "PARTENAIRE";

export interface Publicite {
    id: number;
    titre: string;
    image: string | null;
    video_url: string | null;
    lien: string | null;
    position: PubliciteFormat;
    is_active: boolean;
}

export interface PublicitePayload {
    titre: string;
    image?: File;
    video_url?: string;
    lien?: string;
    position: PubliciteFormat;
    date_debut: string;
    date_fin: string;
    is_active?: boolean;
}

/* ============================================================
 * INTERACTIONS AUDITEUR (vue admin — modération)
 * ============================================================ */
export type IntentionStatut = "NEW" | "PRIE" | "CLOTURE";

export interface IntentionPriere {
    id: number;
    nom: string;
    telephone: string | null;
    intention: string;
    description: string | null;
    is_public: boolean;
    statut: IntentionStatut;
    created_at: string;
}

export type MoyenPaiement = "WAVE" | "ORANGE" | "MOMO" | "ESPECE";
export type DonStatut = "PAYE" | "ECHEC" | "ATTENTE";

export interface Don {
    id: number;
    montant: number;
    moyen: MoyenPaiement;
    transaction_id: string | null;
    statut: DonStatut;
    motif: string | null;
    donateur?: string;
    created_at: string;
}

export interface DonStatistiques {
    total: number;
    nombre_dons: number;
    moyenne: number;
    par_moyen: { moyen: MoyenPaiement; total: number; nombre: number; pourcentage: number }[];
}

export interface NotificationItem {
    id: number;
    titre: string;
    body: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export interface NotificationSendPayload {
    titre: string;
    body: string;
    link?: string;
    user_id?: number;
    diffuser_a_tous?: boolean;
}

/* ============================================================
 * BACK-OFFICE — TÂCHES
 * ============================================================ */
export type TachePriorite = "FAIBLE" | "MOYEN" | "ELEVE";
export type TacheStatut = "A_FAIRE" | "EN_COURS" | "RETARD" | "FAIT";

export interface Tache {
    id: number;
    nom: string;
    assigne: User | null;
    date_debut: string;
    date_echeance: string;
    progression: number;
    priorite: TachePriorite;
    statut: TacheStatut;
    est_en_retard: boolean;
    jours_restants: number;
}

export interface TachePayload {
    nom: string;
    assigne_a?: number;
    date_debut: string;
    date_echeance: string;
    progression?: number;
    priorite: TachePriorite;
    statut: TacheStatut;
}

/* ============================================================
 * DASHBOARD
 * ============================================================ */
export interface DashboardStats {
    compteurs: {
        total_contenus: number;
        emissions_actives: number;
        evenements_a_venir: number;
    };
    actualites: {
        total: number;
        en_cours: number;
        publiees: number;
        en_retard: number;
    };
    emissions_recentes: { id: number; titre: string; nombre_contenus: number }[];
    repartition_contenus: { label: string; publies: number; total: number; ratio: number }[];
    taches_en_retard: {
        id: number;
        nom: string;
        assigne: string | null;
        date_debut: string;
        date_echeance: string;
        progression: number;
        priorite: TachePriorite;
        statut: "RETARD";
        jours_retard: number;
    }[];
}

export type { Role };