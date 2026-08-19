// types/index.ts — types communs partagés entre admin et redacteur

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

// Réponse d'un ->paginate() Laravel (Resource::collection avec pagination)
export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

export type Role = "ADMIN" | "REDACTEUR" | "ANIMATEUR" | "AUDITEUR";

export interface AuthUser {
    id: number;
    nom: string | null;
    prenom: string | null;
    nom_complet: string;
    email: string;
    phone: string | null;
    role: Role;
    avatar: string | null;
    is_active: boolean;
    created_at?: string;
}

// Forme normalisée d'une erreur API après interception (voir core/axios.ts)
export interface ApiError {
    errorMessage: string;
    status?: number;
    errors?: Record<string, string[]>; // erreurs de validation Laravel (422)
}

// Query params génériques pour les listes paginées
export interface ListParams {
    page?: number;
    per_page?: number;
    search?: string;
    [key: string]: string | number | boolean | undefined;
}