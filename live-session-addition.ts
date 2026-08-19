// types/admin.ts — ajout à faire dans le fichier existant (section LIVE)
// Remplace le bloc LiveSession / LiveSessionPayload déjà présent par celui-ci,
// qui ajoute stream_key + obs (nécessaires pour afficher les infos de config OBS).

export interface LiveSessionObsConfig {
    serveur: string;
    cle_de_flux: string;
}

export interface LiveSession {
    id: number;
    titre: string;
    type: "AUDIO" | "VIDEO";
    stream_url: string | null; // null tant que le webhook on-publish n'a pas confirmé le flux
    is_live: boolean;
    auditeurs_live: number;
    signal: "OK" | "FAIBLE";
    duree_en_cours_minutes: number | null;
    programme: { id: number; titre: string } | null;
    obs?: LiveSessionObsConfig; // présent uniquement sur les endpoints /admin/*
}

export interface LiveSessionPayload {
    titre: string;
    programme_id?: number | null;
    type: "AUDIO" | "VIDEO";
}
